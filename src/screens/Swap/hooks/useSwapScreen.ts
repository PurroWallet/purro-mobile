export interface UseSwapScreenResult {
  containerClassName: string;
}

export const useSwapScreen = (): UseSwapScreenResult => ({
  containerClassName: 'flex-1 bg-primary',
});
