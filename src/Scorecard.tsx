import {
  Divider,
  IconButton,
  Link,
  Stack,
  styled,
  SvgIcon,
  SxProps,
  Table,
  TableBody,
  TableBodyProps,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from "@mui/material";
import { Bonus, Deal, Game, Play, Side } from "./types";
import LinkIcon from "@heroicons/react/24/outline/LinkIcon";
import { useHoverDeal, useHoverStyle } from "./HoverableDeal";

const SCCell = styled(TableCell)({ borderBottom: "none", textAlign: "center" });
const leftStyle: SxProps = { borderRight: "1px solid black" };
const bottomStyle: SxProps = { borderBottom: "1px solid black" };

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
    border: "1px solid #dadde9",
  },
}));

function BodySpace(props: TableBodyProps) {
  return (
    <TableBody {...props}>
      <TableRow>
        <SCCell sx={{ height: 60, ...leftStyle }} />
        <SCCell sx={{ height: 60 }} />
      </TableRow>
    </TableBody>
  );
}

function SideHeader({ play, side }: { play: Play; side: Side }) {
  return (
    <SCCell sx={side === Side.NorthSouth ? leftStyle : {}}>
      {side}
      {!play.completed && play.isVulnerable(side) && (
        <Tooltip title="Vulnerable" placement="top" arrow>
          <Typography variant="inherit" component="span">
            🏴‍☠️
          </Typography>
        </Tooltip>
      )}{play.winners().includes(side) && (
        <Typography variant="inherit" component="span">
          🤴
        </Typography>
      )}{" "}
      <Typography variant="caption" component="span" color="text.secondary">
        {play.sidePoints(side)}
      </Typography>
    </SCCell>
  );
}

function InsightCaption({ bonus }: { bonus: Bonus }) {
  if (!bonus.insight || bonus.insight.base === bonus.points) return null;
  const hasDoubleBonus = !!bonus.deal.contract.doubles && bonus.insight.doubleBonus;
  const hasInsightBonus = bonus.insight.isVulnerable && bonus.insight.vulnerableBonus;

  const additionalBonuses: string[] = [];
  if (hasDoubleBonus) additionalBonuses.push(`${bonus.deal.contract.doubles === 2 ? "re" : ""}double`);
  if (hasInsightBonus) additionalBonuses.push(`${bonus.deal.declarer} vulnerable`);

  return (
    <Typography variant="caption" color="text.secondary">
      <Typography variant="inherit" component="span" color="success">
        +{bonus.points - bonus.insight.base}
      </Typography>{" "}
      for {additionalBonuses.join(" and ")}
    </Typography>
  );
}

type BonusItemProps = {
  bonus: Bonus;
  side: Side;
  winner: boolean;
};

function BonusItem({ bonus, side, winner }: BonusItemProps) {
  const { hoverDeal, setHoverDeal } = useHoverDeal();
  const hoverStyle = useHoverStyle();
  const hover = bonus.deal === hoverDeal;

  return (
    <LightTooltip
      placement={side === Side.NorthSouth ? "left" : "right"}
      sx={{ width: 300 }}
      title={
        <Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="subtitle2">
              {bonus.title}{" "}
              <Typography variant="inherit" component="span" color="success">
                +{bonus.points}
              </Typography>
            </Typography>
            {bonus.link && (
              <IconButton
                sx={{ width: 24, height: 24, fontSize: "1.5em" }}
                LinkComponent={Link}
                href={bonus.link}
                target="_blank"
              >
                <SvgIcon fontSize="inherit">
                  <LinkIcon />
                </SvgIcon>
              </IconButton>
            )}
          </Stack>
          <Typography variant="caption">{bonus.deal.description()}</Typography>
          <InsightCaption bonus={bonus} />
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption">{bonus.desc}</Typography>
          {bonus.extra && <Stack mt={1}>{bonus.extra}</Stack>}
        </Stack>
      }
    >
      <Typography
        variant="inherit"
        component="span"
        sx={hoverStyle(hover)}
        onMouseEnter={() => setHoverDeal(bonus.deal)}
        onMouseLeave={() => setHoverDeal(undefined)}
      >
        {bonus.points}{" "}
        {winner && (
          <Typography variant="inherit" component="span">
            👑
          </Typography>
        )}
      </Typography>
    </LightTooltip>
  );
}

type BonusCellProps = {
  side: Side;
  game?: Game;
  bonuses: Bonus[];
  index: number;
};

function BonusCell({ side, game, bonuses, index }: BonusCellProps) {
  const winner = !!game && index === bonuses.length - 1 && game.winner() === side;
  return (
    <SCCell sx={side === Side.NorthSouth ? leftStyle : {}}>
      {index < bonuses.length && <BonusItem side={side} bonus={bonuses[index]} winner={winner} />}
    </SCCell>
  );
}

function BonusPoints({ play }: ScorecardProps) {
  const collect = (side: Side) => play.games.flatMap((game) => game.sides[side].above);
  const ns = collect(Side.NorthSouth);
  const ew = collect(Side.EastWest);
  const rows = Array.from({ length: Math.max(ns.length, ew.length) }, (_, index) => index);

  return (
    <>
      <BodySpace sx={rows.length === 0 ? bottomStyle : {}} />
      <TableBody sx={rows.length === 0 ? {} : bottomStyle}>
        {rows.reverse().map((idx) => (
          <TableRow key={idx}>
            <BonusCell side={Side.NorthSouth} bonuses={ns} index={idx} />
            <BonusCell side={Side.EastWest} bonuses={ew} index={idx} />
          </TableRow>
        ))}
      </TableBody>
    </>
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
          <BonusCell side={Side.NorthSouth} game={game} bonuses={ns} index={idx} />
          <BonusCell side={Side.EastWest} game={game} bonuses={ew} index={idx} />
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
    <Table size="small" sx={{ tableLayout: "fixed", width: 225 }}>
      <TableHead sx={bottomStyle}>
        <TableRow>
          <SideHeader play={props.play} side={Side.NorthSouth} />
          <SideHeader play={props.play} side={Side.EastWest} />
        </TableRow>
      </TableHead>
      <BonusPoints {...props} />
      {props.play.games.map((game, index) => (
        <GamePoints key={index} game={game} />
      ))}
      <BodySpace />
    </Table>
  );
}
