export const formatAddress = (address: string): string => {
  if (address.length > 10) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  return address;
};
