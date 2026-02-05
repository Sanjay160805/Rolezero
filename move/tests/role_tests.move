#[test_only]
module sui_roles::role_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::test_utils;
    use sui_roles::role::{Self, Role};

    // Test addresses
    const CREATOR: address = @0xA;
    const DEVELOPER: address = @0xDEV;
    const RECIPIENT1: address = @0xB;
    const RECIPIENT2: address = @0xC;
    const LEFTOVER_RECIPIENT: address = @0xD;

    // Test constants
    const MIST_PER_SUI: u64 = 1_000_000_000;
    const DEVELOPER_FEE: u64 = 10_000_000; // 0.01 SUI

    // Helper function to create a test role
    fun create_test_role(scenario: &mut Scenario, start_time: u64, expiry_time: u64): address {
        ts::next_tx(scenario, CREATOR);
        {
            let name = b"Test Payroll Role";
            let recipients = vector[RECIPIENT1, RECIPIENT2];
            let amounts = vector[500_000_000, 300_000_000]; // 0.5 SUI, 0.3 SUI
            let scheduled_times = vector[start_time + 3600000, start_time + 7200000]; // 1h, 2h later
            
            let dev_fee_coin = coin::mint_for_testing<SUI>(DEVELOPER_FEE, ts::ctx(scenario));
            
            role::create_role(
                name,
                start_time,
                expiry_time,
                recipients,
                amounts,
                scheduled_times,
                LEFTOVER_RECIPIENT,
                dev_fee_coin,
                DEVELOPER,
                ts::ctx(scenario)
            );
        };
        
        // Get the role ID from shared objects
        ts::next_tx(scenario, CREATOR);
        let role_ids = ts::ids_for_sender<Role>(scenario);
        assert!(vector::length(&role_ids) > 0, 1);
        *vector::borrow(&role_ids, 0)
    }

    // ========== CREATE ROLE TESTS ==========

    #[test]
    fun test_create_role_success() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000; // milliseconds
        let expiry_time = start_time + 2592000000; // 30 days later
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let role = ts::take_shared<Role>(&scenario);
            
            assert!(role::get_name(&role) == b"Test Payroll Role", 0);
            assert!(role::get_owner(&role) == CREATOR, 1);
            assert!(role::get_expiry_time(&role) == expiry_time, 2);
            assert!(role::get_total_funded(&role) == 0, 3);
            assert!(role::get_balance(&role) == 0, 4);
            
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_create_role_with_multiple_payments() {
        let mut scenario = ts::begin(CREATOR);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let name = b"Multi-Payment Role";
            let start_time = 1700000000000;
            let expiry_time = start_time + 2592000000;
            
            // Create 5 payments
            let recipients = vector[RECIPIENT1, RECIPIENT2, @0xE, @0xF, @0x10];
            let amounts = vector[100_000_000, 200_000_000, 300_000_000, 400_000_000, 500_000_000];
            let scheduled_times = vector[
                start_time + 3600000,
                start_time + 7200000,
                start_time + 10800000,
                start_time + 14400000,
                start_time + 18000000
            ];
            
            let dev_fee_coin = coin::mint_for_testing<SUI>(DEVELOPER_FEE, ts::ctx(&mut scenario));
            
            role::create_role(
                name,
                start_time,
                expiry_time,
                recipients,
                amounts,
                scheduled_times,
                LEFTOVER_RECIPIENT,
                dev_fee_coin,
                DEVELOPER,
                ts::ctx(&mut scenario)
            );
        };
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let role = ts::take_shared<Role>(&scenario);
            assert!(role::get_name(&role) == b"Multi-Payment Role", 0);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_developer_fee_transferred() {
        let mut scenario = ts::begin(CREATOR);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let dev_fee_coin = coin::mint_for_testing<SUI>(DEVELOPER_FEE, ts::ctx(&mut scenario));
            let fee_value = coin::value(&dev_fee_coin);
            
            role::create_role(
                b"Fee Test Role",
                1700000000000,
                1702592000000,
                vector[RECIPIENT1],
                vector[500_000_000],
                vector[1700003600000],
                LEFTOVER_RECIPIENT,
                dev_fee_coin,
                DEVELOPER,
                ts::ctx(&mut scenario)
            );
            
            assert!(fee_value == DEVELOPER_FEE, 0);
        };
        
        ts::next_tx(&mut scenario, DEVELOPER);
        {
            // Developer should receive the fee coin
            let fee_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&fee_coin) == DEVELOPER_FEE, 1);
            ts::return_to_sender(&scenario, fee_coin);
        };
        
        ts::end(scenario);
    }

    // ========== FUND ROLE TESTS ==========

    #[test]
    fun test_fund_role_success() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario)); // 1 SUI
            
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            
            assert!(role::get_balance(&role) == 1_000_000_000, 0);
            assert!(role::get_total_funded(&role) == 1_000_000_000, 1);
            
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_fund_role_multiple_sponsors() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        // First sponsor
        ts::next_tx(&mut scenario, @0xSPONSOR1);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(500_000_000, ts::ctx(&mut scenario));
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        // Second sponsor
        ts::next_tx(&mut scenario, @0xSPONSOR2);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(700_000_000, ts::ctx(&mut scenario));
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            
            assert!(role::get_balance(&role) == 1_200_000_000, 0);
            assert!(role::get_total_funded(&role) == 1_200_000_000, 1);
            
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_fund_role_small_amount() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario)); // 0.000001 SUI
            
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            
            assert!(role::get_balance(&role) == 1000, 0);
            
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    // ========== EXECUTE PAYMENT TESTS ==========

    #[test]
    fun test_execute_payment_when_ready() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let payment_time = start_time + 3600000; // 1 hour later
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        // Fund the role
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario));
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        // Execute payment at scheduled time
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, payment_time);
            
            role::execute_payments(&mut role, &clock, ts::ctx(&mut scenario));
            
            // Balance should decrease by first payment amount (500_000_000)
            assert!(role::get_balance(&role) == 500_000_000, 0);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        // Verify recipient received payment
        ts::next_tx(&mut scenario, RECIPIENT1);
        {
            let payment_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&payment_coin) == 500_000_000, 1);
            ts::return_to_sender(&scenario, payment_coin);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_execute_payment_before_start_fails() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        // Fund the role
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario));
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        // Try to execute before start time - should abort
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, start_time - 1000); // Before start
            
            role::execute_payments(&mut role, &clock, ts::ctx(&mut scenario)); // Should abort with ERR_NOT_STARTED
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = sui_roles::role::ERR_NOT_STARTED)]
    fun test_execute_payment_too_early_aborts() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario));
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, start_time - 1);
            
            role::execute_payments(&mut role, &clock, ts::ctx(&mut scenario)); // Should abort
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_execute_payment_insufficient_balance_skips() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let payment_time = start_time + 3600000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        // Fund with insufficient amount
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(100_000_000, ts::ctx(&mut scenario)); // Only 0.1 SUI
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        // Try to execute - should skip due to insufficient balance
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, payment_time);
            
            role::execute_payments(&mut role, &clock, ts::ctx(&mut scenario));
            
            // Balance should remain unchanged (payment skipped)
            assert!(role::get_balance(&role) == 100_000_000, 0);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_execute_multiple_payments_in_order() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        // Fund the role sufficiently
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario));
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        // Execute first payment
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, start_time + 3600000); // First payment time
            
            role::execute_payments(&mut role, &clock, ts::ctx(&mut scenario));
            assert!(role::get_balance(&role) == 500_000_000, 0); // After first payment
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        // Execute second payment
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, start_time + 7200000); // Second payment time
            
            role::execute_payments(&mut role, &clock, ts::ctx(&mut scenario));
            assert!(role::get_balance(&role) == 200_000_000, 0); // After both payments
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    // ========== EXTEND EXPIRY TESTS ==========

    #[test]
    fun test_extend_expiry_as_owner() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        let new_expiry = expiry_time + 2592000000; // Extend by another 30 days
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, start_time + 1000000); // Some time after start
            
            role::extend_expiry(&mut role, new_expiry, &clock, ts::ctx(&mut scenario));
            
            assert!(role::get_expiry_time(&role) == new_expiry, 0);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = sui_roles::role::ERR_NOT_OWNER)]
    fun test_extend_expiry_as_non_owner_fails() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        let new_expiry = expiry_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, @0xATTACKER); // Not the owner
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, start_time + 1000000);
            
            role::extend_expiry(&mut role, new_expiry, &clock, ts::ctx(&mut scenario)); // Should abort
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = sui_roles::role::ERR_ALREADY_EXPIRED)]
    fun test_extend_expiry_after_expiry_fails() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        let new_expiry = expiry_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, expiry_time + 1000); // After expiry
            
            role::extend_expiry(&mut role, new_expiry, &clock, ts::ctx(&mut scenario)); // Should abort
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = sui_roles::role::ERR_NOT_TIME)]
    fun test_extend_expiry_to_earlier_time_fails() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        let new_expiry = expiry_time - 1000000; // Earlier than current expiry
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, start_time + 1000000);
            
            role::extend_expiry(&mut role, new_expiry, &clock, ts::ctx(&mut scenario)); // Should abort
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    // ========== EXECUTE EXPIRY TESTS ==========

    #[test]
    fun test_execute_expiry_transfers_leftover() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        // Fund with extra amount
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(1_500_000_000, ts::ctx(&mut scenario)); // 1.5 SUI
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        // Execute expiry after expiry time
        ts::next_tx(&mut scenario, @0xANYONE); // Anyone can call
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, expiry_time + 1000);
            
            role::execute_expiry(&mut role, &clock, ts::ctx(&mut scenario));
            
            // All balance should be transferred
            assert!(role::get_balance(&role) == 0, 0);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        // Verify leftover recipient received funds
        ts::next_tx(&mut scenario, LEFTOVER_RECIPIENT);
        {
            let leftover_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            // Should receive remaining balance after payments (1.5 - 0.5 - 0.3 = 0.7 SUI)
            assert!(coin::value(&leftover_coin) >= 500_000_000, 1);
            ts::return_to_sender(&scenario, leftover_coin);
        };
        
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = sui_roles::role::ERR_NOT_TIME)]
    fun test_execute_expiry_before_expiry_fails() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, expiry_time - 1000); // Before expiry
            
            role::execute_expiry(&mut role, &clock, ts::ctx(&mut scenario)); // Should abort
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_execute_expiry_anyone_can_call() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        // Random user executes expiry
        ts::next_tx(&mut scenario, @0xRANDOM);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, expiry_time + 1000);
            
            role::execute_expiry(&mut role, &clock, ts::ctx(&mut scenario)); // Should succeed
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    // ========== EDGE CASE TESTS ==========

    #[test]
    fun test_role_with_single_payment() {
        let mut scenario = ts::begin(CREATOR);
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let start_time = 1700000000000;
            let expiry_time = start_time + 2592000000;
            
            let dev_fee_coin = coin::mint_for_testing<SUI>(DEVELOPER_FEE, ts::ctx(&mut scenario));
            
            role::create_role(
                b"Single Payment Role",
                start_time,
                expiry_time,
                vector[RECIPIENT1],
                vector[1_000_000_000],
                vector[start_time + 3600000],
                LEFTOVER_RECIPIENT,
                dev_fee_coin,
                DEVELOPER,
                ts::ctx(&mut scenario)
            );
        };
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let role = ts::take_shared<Role>(&scenario);
            assert!(role::get_name(&role) == b"Single Payment Role", 0);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_payment_at_exact_expiry_time() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        ts::next_tx(&mut scenario, CREATOR);
        {
            let dev_fee_coin = coin::mint_for_testing<SUI>(DEVELOPER_FEE, ts::ctx(&mut scenario));
            
            // Schedule payment at exact expiry time
            role::create_role(
                b"Edge Case Role",
                start_time,
                expiry_time,
                vector[RECIPIENT1],
                vector[500_000_000],
                vector[expiry_time], // Scheduled at expiry
                LEFTOVER_RECIPIENT,
                dev_fee_coin,
                DEVELOPER,
                ts::ctx(&mut scenario)
            );
        };
        
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(1_000_000_000, ts::ctx(&mut scenario));
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        // Execute expiry should handle this payment
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, expiry_time + 1);
            
            role::execute_expiry(&mut role, &clock, ts::ctx(&mut scenario));
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_zero_leftover_amount() {
        let mut scenario = ts::begin(CREATOR);
        let start_time = 1700000000000;
        let expiry_time = start_time + 2592000000;
        
        create_test_role(&mut scenario, start_time, expiry_time);
        
        // Fund with exact payment amounts (0.5 + 0.3 = 0.8 SUI)
        ts::next_tx(&mut scenario, @0xSPONSOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let funding = coin::mint_for_testing<SUI>(800_000_000, ts::ctx(&mut scenario));
            role::fund_role(&mut role, funding, ts::ctx(&mut scenario));
            ts::return_shared(role);
        };
        
        // Execute expiry
        ts::next_tx(&mut scenario, CREATOR);
        {
            let mut role = ts::take_shared<Role>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            clock::set_for_testing(&mut clock, expiry_time + 1000);
            
            role::execute_expiry(&mut role, &clock, ts::ctx(&mut scenario));
            
            // Should have zero balance after all payments
            assert!(role::get_balance(&role) == 0, 0);
            
            clock::destroy_for_testing(clock);
            ts::return_shared(role);
        };
        
        ts::end(scenario);
    }
}
