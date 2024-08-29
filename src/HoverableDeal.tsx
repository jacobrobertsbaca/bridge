import { createContext, useCallback, useContext } from "react";
import { Deal } from "./types";
import { SxProps, useTheme } from "@mui/material";

export type HoverableDeal = {
  hoverDeal?: Deal;
  setHoverDeal: (deal?: Deal) => void;
};

export const HoverDeal = createContext<HoverableDeal>({ hoverDeal: undefined, setHoverDeal: () => {} });

export function useHoverDeal() {
  return useContext(HoverDeal);
}

export function useHoverStyle(): (hover: boolean) => SxProps {
  const theme = useTheme();
  return useCallback(
    (hover: boolean) => ({
      color: hover ? theme.palette.primary.main : undefined,
      fontWeight: hover ? 700 : undefined,
    }),
    [theme]
  );
}
