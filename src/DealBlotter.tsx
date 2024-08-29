import {
  IconButton,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Deal, Play, Side } from "./types";

import DeleteIcon from "@heroicons/react/24/solid/XMarkIcon";
import { useHoverDeal, useHoverStyle } from "./HoverableDeal";
import { useState } from "react";

function DealCaption({ index, deals, play }: { index: number; deals: Deal[]; play: Play }) {
  if (!play.completed) return null;
  if (index !== deals.length - 1) return null;

  const winners = play.winners();
  if (winners.length === 0) return null;

  let message: string;
  if (winners.length === 1) {
    message = `${winners[0]} wins with ${play.sidePoints(winners[0])} points`;
  } else {
    message = `${winners.join(", ")} tie with ${play.sidePoints(winners[0])} points`;
  }

  const nwWins = play.winCount(Side.NorthSouth);
  const ewWins = play.winCount(Side.EastWest);
  if (nwWins < 2 && ewWins < 2 && deals[index].isLast) message += " in an unfinished rubber";

  return (
    <Typography variant="caption" color="text.secondary">
      {message}
    </Typography>
  );
}

function DealBlotterRow({ play, deals, setDeals, index }: DealBlotterProps & { index: number }) {
  const { hoverDeal, setHoverDeal } = useHoverDeal();
  const [hover, setHover] = useState(false);
  const hoverStyle = useHoverStyle();

  const deal = deals[index];
  const dealPts = play.dealPoints(deal);

  return (
    <TableRow
      hover
      onMouseEnter={() => {
        setHoverDeal(deal);
        setHover(true);
      }}
      onMouseLeave={() => {
        setHoverDeal(undefined);
        setHover(false);
      }}
      sx={{ height: 48 }}
    >
      <TableCell>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography variant="inherit" component="span" color="text.secondary">
            #{index + 1}:{" "}
          </Typography>
          <Stack>
            <Typography variant="inherit" component="span" sx={hoverStyle(deal === hoverDeal)}>
              {deal.description()}{" "}
              <Typography variant="caption" component="span" color={dealPts >= 0 ? "success" : "warning"}>
                {dealPts >= 0 ? "+" : ""}
                {dealPts}
              </Typography>
            </Typography>
            <DealCaption index={index} deals={deals} play={play} />
          </Stack>
        </Stack>
      </TableCell>
      <TableCell sx={{ textAlign: "right" }}>
        {hover && (
          <IconButton size="small" onClick={() => setDeals(deals.filter((_, i) => i !== index))}>
            <SvgIcon>
              <DeleteIcon />
            </SvgIcon>
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
}

export type DealBlotterProps = {
  deals: Deal[];
  setDeals: (deals: Deal[]) => void;
  play: Play;
};

export function DealBlotter(props: DealBlotterProps) {
  if (props.deals.length === 0) return null;
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Deals</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {props.deals.map((_, index) => (
          <DealBlotterRow key={index} index={index} {...props} />
        ))}
      </TableBody>
    </Table>
  );
}
