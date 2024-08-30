import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import DealInput from "./DealInput";
import { useState } from "react";
import { Deal, Play } from "./types";
import { Scorecard } from "./Scorecard";
import { Divider, Stack, useMediaQuery, useTheme } from "@mui/material";
import { DealBlotter } from "./DealBlotter";
import { HoverDeal } from "./HoverableDeal";
import useWindowSize from "react-use/lib/useWindowSize";
import ReactConfetti from "react-confetti";

export default function App() {
  const [play, setPlay] = useState(new Play());
  const [deals, setDeals] = useState<Deal[]>([]);
  const [hoverDeal, setHoverDeal] = useState<Deal | undefined>(undefined);

  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up("md"));

  const { width, height } = useWindowSize();
  const [isExploding, setIsExploding] = useState(false);

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: 1,
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {isExploding && (
        <ReactConfetti width={width} height={height} onConfettiComplete={() => setIsExploding(false)} recycle={false} />
      )}
      <HoverDeal.Provider value={{ hoverDeal, setHoverDeal }}>
        <Box sx={{ width: 1, my: 4 }}>
          <Stack direction={{ xs: "column-reverse", md: "row" }} justifyContent="center" alignItems="center">
            <Stack>
              <DealInput
                disabled={play.completed}
                onDeal={(deal) => {
                  play.score(deal);
                  setDeals((deals) => [...deals, deal]);
                  if (play.completed) setIsExploding(true);
                }}
              />
              <DealBlotter
                play={play}
                deals={deals}
                setDeals={(deals) => {
                  setPlay(Play.fromDeals(deals));
                  setDeals(deals);
                }}
              />
            </Stack>
            <Divider
              orientation={md ? "vertical" : "horizontal"}
              flexItem
              sx={md ? { ml: 4, mr: 6 } : { mb: 4, mt: 6 }}
            />
            <Stack>
              <Scorecard play={play} deals={deals} />
            </Stack>
          </Stack>
        </Box>
      </HoverDeal.Provider>
    </Container>
  );
}
