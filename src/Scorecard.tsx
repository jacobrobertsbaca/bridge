import {
  Stack,
  styled,
  SxProps,
  Table,
  TableBody,
  TableBodyProps,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Bonus, Deal, Game, Play, Side } from "./types";

const SCCell = styled(TableCell)({ borderBottom: "none" });
const leftStyle: SxProps = { borderRight: "2px solid black" };
const bottomStyle: SxProps = { borderBottom: "2px solid black" };

function BodySpace(props: TableBodyProps) {
  return (
    <TableBody {...props}>
      <TableRow>
        <SCCell sx={{ height: 80, ...leftStyle }} />
        <SCCell sx={{ height: 80 }} />
      </TableRow>
    </TableBody>
  );
}

type BonusItemProps = {
  bonus: Bonus;
};

function BonusItem({ bonus }: BonusItemProps) {
  return (
    <Tooltip
      arrow
      title={
        <Stack>
          <Typography variant="subtitle2">{bonus.title}</Typography>
          <Typography variant="inherit" fontStyle="italic">
            {bonus.deal.description()}
          </Typography>
          <Typography variant="inherit">{bonus.desc}</Typography>
        </Stack>
      }
    >
      <Typography variant="inherit" component="span">
        {bonus.points}
      </Typography>
    </Tooltip>
  );
}

function BonusPoints({ play }: ScorecardProps) {
  const collect = (side: Side) => play.games.flatMap((game) => game.sides[side].above);
  const ns = collect(Side.NorthSouth);
  const ew = collect(Side.EastWest);
  const rows = Array.from({ length: Math.max(ns.length, ew.length) }, (_, index) => index);

  if (rows.length === 0) return <BodySpace sx={bottomStyle} />;

  return (
    <TableBody sx={bottomStyle}>
      {rows.map((idx) => (
        <TableRow key={idx}>
          <SCCell sx={leftStyle}>{idx < ns.length && <BonusItem bonus={ns[idx]} />}</SCCell>
          <SCCell>{idx < ew.length && <BonusItem bonus={ew[idx]} />}</SCCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

function GamePoints({ game }: { game: Game }) {
  const collect = (side: Side) => game.sides[side].below;
  const ns = collect(Side.NorthSouth);
  const ew = collect(Side.EastWest);
  const rows = Array.from({ length: Math.max(ns.length, ew.length) }, (_, index) => index);

  return (
    <TableBody sx={game.completed ? { borderBottom: "1.5px dashed gray" } : {}}>
      {rows.map((idx) => (
        <TableRow key={idx}>
          <SCCell sx={leftStyle}>{idx < ns.length && <BonusItem bonus={ns[idx]} />}</SCCell>
          <SCCell>{idx < ew.length && <BonusItem bonus={ew[idx]} />}</SCCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export type ScorecardProps = {
  play: Play;
  deals: Deal[];
};

export function Scorecard(props: ScorecardProps) {
  return (
    <Table size="small">
      <TableHead sx={bottomStyle}>
        <TableRow>
          <SCCell sx={leftStyle}>NS</SCCell>
          <SCCell>EW</SCCell>
        </TableRow>
      </TableHead>
      <BonusPoints {...props} />
      {props.play.games.map((game, index) => (
        <GamePoints key={index} game={game} />
      ))}

      {/* Show space below the line if no games yet */}
      {props.play.games.length === 0 && <BodySpace />}
    </Table>
  );
}
