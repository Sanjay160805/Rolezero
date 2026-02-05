export interface RecipientInfo {
  ensName?: string;
  address: string;
}

export const formatRecipient = (recipient: RecipientInfo): string => {
  return recipient.ensName || recipient.address;
};

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  if (address.endsWith('.eth')) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const isEnsName = (input: string): boolean => {
  return input.endsWith('.eth') || input.includes('.');
};
