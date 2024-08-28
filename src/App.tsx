import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import DealInput from "./DealInput";

export default function App() {
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
        <DealInput onDeal={(deal) => console.log(deal)} />
      </Box>
    </Container>
  );
}
