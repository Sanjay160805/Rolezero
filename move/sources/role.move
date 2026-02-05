#[allow(duplicate_alias)]
module sui_roles::role {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::event;

    // Error codes
    const ERR_NOT_STARTED: u64 = 1;

    const ERR_NOT_TIME: u64 = 3;
    const ERR_NOT_OWNER: u64 = 4;
    const ERR_ALREADY_EXPIRED: u64 = 5;

    // Structs
    public struct Role has key, store {
        id: UID,
        owner: address,
        name: vector<u8>,
        start_time: u64,
        expiry_time: u64,
        payments: vector<Payment>,
        leftover_recipient: address,
        balance: Balance<SUI>,
        total_funded: u64,
        developer_fee: u64,
    }

    public struct Payment has store, copy, drop {
        recipient: address,
        amount: u64,
        scheduled_time: u64,
        executed: bool,
    }

    // Events
    public struct RoleCreated has copy, drop {
        role_id: address,
        name: vector<u8>,
        creator: address,
    }

    public struct FundEvent has copy, drop {
        role_id: address,
        sender: address,
        amount: u64,
    }

    public struct PaymentExecuted has copy, drop {
        role_id: address,
        recipient: address,
        amount: u64,
    }

    public struct LeftoverTransferred has copy, drop {
        role_id: address,
        recipient: address,
        amount: u64,
    }

    public struct ExpiryExtended has copy, drop {
        role_id: address,
        old_expiry: u64,
        new_expiry: u64,
    }

    public struct RoleExpired has copy, drop {
        role_id: address,
        total_funded: u64,
        leftover_amount: u64,
    }

    // Create a new role
    public fun create_role(
        name: vector<u8>,
        start_time: u64,
        expiry_time: u64,
        recipients: vector<address>,
        amounts: vector<u64>,
        scheduled_times: vector<u64>,
        leftover_recipient: address,
        developer_fee_coin: Coin<SUI>,
        developer_address: address,
        ctx: &mut TxContext
    ) {
        // Transfer 1% developer fee to developer
        let fee_amount = coin::value(&developer_fee_coin);
        transfer::public_transfer(developer_fee_coin, developer_address);

        let mut payments = vector::empty<Payment>();
        let len = vector::length(&recipients);
        let mut i = 0;

        while (i < len) {
            vector::push_back(&mut payments, Payment {
                recipient: *vector::borrow(&recipients, i),
                amount: *vector::borrow(&amounts, i),
                scheduled_time: *vector::borrow(&scheduled_times, i),
                executed: false,
            });
            i = i + 1;
        };

        let role = Role {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            start_time,
            expiry_time,
            payments,
            leftover_recipient,
            balance: balance::zero(),
            total_funded: 0,
            developer_fee: fee_amount,
        };

        let role_id = object::uid_to_address(&role.id);
       
        event::emit(RoleCreated {
            role_id,
            name,
            creator: tx_context::sender(ctx),
        });

        transfer::share_object(role);
    }

    // Fund a role
    public fun fund_role(
        role: &mut Role,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        let coin_balance = coin::into_balance(payment);
        balance::join(&mut role.balance, coin_balance);
        role.total_funded = role.total_funded + amount;

        event::emit(FundEvent {
            role_id: object::uid_to_address(&role.id),
            sender: tx_context::sender(ctx),
            amount,
        });
    }

    // Execute payments
    public fun execute_payments(
        role: &mut Role,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= role.start_time, ERR_NOT_STARTED);

        let len = vector::length(&role.payments);
        let mut i = 0;

        while (i < len) {
            let payment = vector::borrow_mut(&mut role.payments, i);
           
            // Execute immediately when scheduled time arrives
            if (!payment.executed && current_time >= payment.scheduled_time) {
                let available = balance::value(&role.balance);
               
                if (available >= payment.amount) {
                    let payment_coin = coin::take(
                        &mut role.balance,
                        payment.amount,
                        ctx
                    );
                    transfer::public_transfer(payment_coin, payment.recipient);
                    payment.executed = true;

                    event::emit(PaymentExecuted {
                        role_id: object::uid_to_address(&role.id),
                        recipient: payment.recipient,
                        amount: payment.amount,
                    });
                };
            };
           
            i = i + 1;
        };
    }

    // Extend expiry (owner only, before current expiry)
    public fun extend_expiry(
        role: &mut Role,
        new_expiry: u64,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == role.owner, ERR_NOT_OWNER);
       
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < role.expiry_time, ERR_ALREADY_EXPIRED);
        assert!(new_expiry > role.expiry_time, ERR_NOT_TIME);

        let old_expiry = role.expiry_time;
        role.expiry_time = new_expiry;

        event::emit(ExpiryExtended {
            role_id: object::uid_to_address(&role.id),
            old_expiry,
            new_expiry,
        });
    }

    // Execute expiry: pay remaining, send leftover (anyone can call after expiry)
    public fun execute_expiry(
        role: &mut Role,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time > role.expiry_time, ERR_NOT_TIME);

        // Execute any remaining scheduled payments
        let len = vector::length(&role.payments);
        let mut i = 0;

        while (i < len) {
            let payment = vector::borrow_mut(&mut role.payments, i);
           
            if (!payment.executed) {
                let available = balance::value(&role.balance);
               
                if (available >= payment.amount) {
                    let payment_coin = coin::take(
                        &mut role.balance,
                        payment.amount,
                        ctx
                    );
                    transfer::public_transfer(payment_coin, payment.recipient);
                    payment.executed = true;

                    event::emit(PaymentExecuted {
                        role_id: object::uid_to_address(&role.id),
                        recipient: payment.recipient,
                        amount: payment.amount,
                    });
                };
            };
           
            i = i + 1;
        };

        // Transfer leftover funds
        let remaining = balance::value(&role.balance);
       
        if (remaining > 0) {
            let leftover_coin = coin::take(
                &mut role.balance,
                remaining,
                ctx
            );
            transfer::public_transfer(leftover_coin, role.leftover_recipient);

            event::emit(LeftoverTransferred {
                role_id: object::uid_to_address(&role.id),
                recipient: role.leftover_recipient,
                amount: remaining,
            });
        };

        event::emit(RoleExpired {
            role_id: object::uid_to_address(&role.id),
            total_funded: role.total_funded,
            leftover_amount: remaining,
        });
    }

    // Transfer leftover funds after expiry
    public fun transfer_leftover(
        role: &mut Role,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time > role.expiry_time, ERR_NOT_TIME);

        let remaining = balance::value(&role.balance);
       
        if (remaining > 0) {
            let leftover_coin = coin::take(
                &mut role.balance,
                remaining,
                ctx
            );
            transfer::public_transfer(leftover_coin, role.leftover_recipient);

            event::emit(LeftoverTransferred {
                role_id: object::uid_to_address(&role.id),
                recipient: role.leftover_recipient,
                amount: remaining,
            });
        };
    }

    // View functions
    public fun get_balance(role: &Role): u64 {
        balance::value(&role.balance)
    }

    public fun get_total_funded(role: &Role): u64 {
        role.total_funded
    }

    public fun get_name(role: &Role): vector<u8> {
        role.name
    }

    public fun get_expiry_time(role: &Role): u64 {
        role.expiry_time
    }

    public fun get_owner(role: &Role): address {
        role.owner
    }

    public fun is_expired(role: &Role, clock: &Clock): bool {
        clock::timestamp_ms(clock) > role.expiry_time
    }
}
