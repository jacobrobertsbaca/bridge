import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import DealInput from "./DealInput";
import { useState } from "react";
import { Deal, Play } from "./types";
import { Scorecard } from "./Scorecard";

export default function App() {
  const [play, setPlay] = useState(new Play());
  const [deals, setDeals] = useState<Deal[]>([]);

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
      <Box sx={{ my: 4 }}>
        <DealInput
          disabled={play.completed}
          onDeal={(deal) => {
            play.score(deal);
            setDeals((deals) => [...deals, deal]);
          }}
        />

        <Scorecard play={play} deals={deals} />
      </Box>
    </Container>
  );
}
