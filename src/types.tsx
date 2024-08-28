import { Typography, TypographyProps } from "@mui/material";
import React from "react";

export enum Trump {
  Clubs = 1,
  Diamonds = 2,
  Hearts = 3,
  Spades = 4,
  NoTrump = 5,
}

function parseTrump(trump: string): Trump | undefined {
  switch (trump.toLowerCase()) {
    case "c":
      return Trump.Clubs;
    case "d":
      return Trump.Diamonds;
    case "h":
      return Trump.Hearts;
    case "s":
      return Trump.Spades;
    case "n":
    case "nt":
      return Trump.NoTrump;
    default:
      return undefined;
  }
}

function getTrumpSymbol(trump: Trump): React.ReactNode {
  function getNode(symbol: string, color?: string) {
    return (
      <Typography variant="inherit" sx={{ color }} component="span" fontSize={color ? "1.33em" : undefined}>
        {symbol}
      </Typography>
    );
  }

  switch (trump) {
    case Trump.Clubs:
      return getNode("♣", "black");
    case Trump.Diamonds:
      return getNode("♦", "red");
    case Trump.Hearts:
      return getNode("♥", "red");
    case Trump.Spades:
      return getNode("♠", "black");
    case Trump.NoTrump:
      return getNode("NT");
  }
}

export enum Side {
  NorthSouth = "NS",
  EastWest = "EW",
}

function otherSide(side: Side): Side {
  return side === Side.NorthSouth ? Side.EastWest : Side.NorthSouth;
}

export enum Honors {
  Partial = "H",
  Full = "FH",
}

export class Contract {
  static readonly BOOK_COUNT = 6;
  static readonly REGEX = /^([1-7])(c|d|h|s|n|nt)(|x|xx)$/i;
  static readonly MASK = /^(|[1-7]|[1-7](c|d|h|s|n|nt)|[1-7](c|d|h|s|n|nt)(|x|xx))$/i;

  /** The contract level from 1-7 */
  level: number;
  /** The trump card suit */
  trump: Trump;
  /** The number of doubles (0-2). 1 = doubled, 2 = redoubled. */
  doubles: number;

  static parse(contract: string): Contract | undefined {
    const match = Contract.REGEX.exec(contract);
    if (!match) return undefined;
    const level = parseInt(match[1]);
    const trump = parseTrump(match[2]);
    if (!trump) return undefined;
    const doubles = match[3].length;
    return new Contract(level, trump, doubles);
  }

  constructor(level: number, trump: Trump, doubles: number) {
    console.assert(Number.isInteger(level), `The contract level must be an integer. Got ${level}`);
    console.assert(Number.isInteger(doubles), `The double count must be an integer. Got ${doubles}`);
    console.assert(1 <= level && level <= 7, `The contract level must be 1-7. Got ${level}`);
    console.assert(0 <= doubles && doubles <= 2, `The double count must be 0-2. Got ${doubles}`);

    this.level = level;
    this.trump = trump;
    this.doubles = doubles;
  }

  /** The raw tricks needed to win the contract (0-13). */
  rawTricks(): number {
    return this.level + Contract.BOOK_COUNT;
  }

  /** 1x for undoubled, 2x for doubled, 4x for redoubled */
  doubleMultiplier(): number {
    return 2 ** this.doubles;
  }

  toSymbol(): React.ReactNode {
    return (
      <Typography variant="inherit" component="span">
        {this.level}
        {getTrumpSymbol(this.trump)}
        {"X".repeat(this.doubles)}
      </Typography>
    );
  }
}

export class Deal {
  /** The declarer for this deal */
  declarer: Side;
  /** The contract for this deal */
  contract: Contract;
  /** The raw number of tricks achieved (0-13) */
  tricks: number;
  /** The hand honors, if any, per side */
  honors: Partial<Record<Side, Honors>>;

  constructor(declarer: Side, contract: Contract, tricks: number, honors: Partial<Record<Side, Honors>>) {
    console.assert(Number.isInteger(tricks), `The number of tricks must be an integer. Got ${tricks}`);
    console.assert(0 <= tricks && tricks <= 13, `The number of tricks must be 0-13. Got ${tricks}`);

    this.declarer = declarer;
    this.contract = contract;
    this.tricks = tricks;
    this.honors = honors;
  }

  /** Did the declarer win this contract? */
  won(): boolean {
    return this.tricks >= this.contract.rawTricks();
  }

  description(): React.ReactNode {
    const trickDiff = this.tricks - this.contract.rawTricks();
    let suffix;
    if (trickDiff >= 0) suffix = `made ${this.tricks - Contract.BOOK_COUNT}`;
    else suffix = `down ${-trickDiff}`;

    return (
      <Typography component="span" variant="inherit">
        {this.declarer} bid {this.contract.toSymbol()}, {suffix}
      </Typography>
    );
  }
}

/**
 * Contract points per trump.
 * First number is base points on first trick, second is base points for subsequent tricks.
 */
const CONTRACT_POINTS: Record<Trump, [number, number]> = {
  [Trump.Clubs]: [20, 20],
  [Trump.Diamonds]: [20, 20],
  [Trump.Hearts]: [30, 30],
  [Trump.Spades]: [30, 30],
  [Trump.NoTrump]: [40, 30],
};

/**
 * Contract points per overtrick.
 * First number is undoubled, second is doubled, third is redoubled.
 * Points listed are invulnerable. Vulnerable points are doubled when contract has been doubled.
 */
const OVERTRICK_POINTS: Record<Trump, [number, number, number]> = {
  [Trump.Clubs]: [20, 100, 200],
  [Trump.Diamonds]: [20, 100, 200],
  [Trump.Hearts]: [30, 100, 200],
  [Trump.Spades]: [30, 100, 200],
  [Trump.NoTrump]: [30, 100, 200],
};

/**
 * Bonus for winning a slam.
 * First row is small slam, second is grand slam.
 * First column is non-vulnerable, second is vulnerable.
 */
const SLAM_BONUS: [[number, number], [number, number]] = [
  [500, 750],
  [1000, 1500],
];

/**
 * Points awarded for winning a doubled or redoubled contract.
 */
const INSULT_POINTS: [number, number] = [50, 100];

/**
 * First row is point value for first undertrick.
 * Second row is point value for second and third undertricks.
 * Third row is point value for fourth and subsequent undertricks.
 *
 * First column is undoubled, second is doubled, third is redoubled.
 */
type UndertrickTable = [[number, number, number], [number, number, number], [number, number, number]];

/**
 * Penalty points awarded for each undertrick.
 * First table is invulnerable, second is vulnerable.
 */
const UNDERTRICK_POINTS: [UndertrickTable, UndertrickTable] = [
  [
    [50, 100, 200],
    [50, 200, 400],
    [50, 300, 600],
  ],
  [
    [100, 200, 400],
    [100, 300, 600],
    [100, 300, 600],
  ],
];

/**
 * Bonus points awarded for winning a rubber.
 * First number is a slow rubber, second is a fast rubber.
 */
const RUBBER_POINTS: [number, number] = [500, 700];

/** Represents the state of play for a game of rubber bridge. */
export class Play {
  completed: boolean;
  games: Game[];

  static fromDeals(deals: Deal[]): Play {
    const play = new Play();
    for (const deal of deals) play.score(deal);
    return play;
  }

  constructor() {
    this.completed = false;
    this.games = [];
  }

  /** Gets the ongoing game for this play. Cannot call when play has completed. */
  ongoing(): Game {
    if (this.completed) throw new Error("Cannot get ongoing game when play is completed.");
    const last = this.games[this.games.length - 1];
    if (!last || last.completed) {
      const game = new Game(this);
      this.games.push(game);
      return game;
    }
    return last;
  }

  /** Handles scoring for a new deal. */
  score(deal: Deal): void {
    this.ongoing().score(deal);
  }

  /** Whether or not a side is vulnerable at this stage of the game. */
  isVulnerable(side: Side): boolean {
    for (const game of this.games) {
      if (game.completed && game.winner() === side) return true;
    }
    return false;
  }
}

/** Represents either an in-progress or completed game (in the scoring sense) of rubber bridge */
export class Game {
  private play: Play;
  completed: boolean;
  sides: Record<Side, GameSide>;

  constructor(play: Play) {
    this.play = play;
    this.completed = false;
    this.sides = Object.values(Side).reduce((acc, side) => {
      acc[side] = new GameSide();
      return acc;
    }, {} as Record<Side, GameSide>);
  }

  /* Determines who won the game. `undefined` if none yet. */
  winner(): Side | undefined {
    for (const side of Object.values(Side)) {
      if (this.sides[side].contractPoints() >= 100) return side;
    }
    return undefined;
  }

  score(deal: Deal): void {
    this.scoreContract(deal);
    this.scoreOvertricks(deal);
    this.scoreSlamBonus(deal);
    this.scoreInsults(deal);
    this.scoreUndertricks(deal);
    this.scoreHonorBonus(deal);
    this.scoreRubberBonus(deal);

    if (this.winner() !== undefined) this.completed = true;
  }

  private scoreContract(deal: Deal): void {
    if (!deal.won()) return;

    let points = 0;
    for (let i = 0; i < deal.contract.level; i++) {
      const selector = i === 0 ? 0 : 1;
      points += CONTRACT_POINTS[deal.contract.trump][selector] * deal.contract.doubleMultiplier();
    }

    this.sides[deal.declarer].below.push({
      title: "Contract Points",
      desc: `Points awarded for winning the contract.`,
      points,
      deal,
    });
  }

  private scoreOvertricks(deal: Deal): void {
    const overtricks = deal.tricks - deal.contract.rawTricks();
    if (overtricks <= 0) return;

    let points = overtricks * OVERTRICK_POINTS[deal.contract.trump][deal.contract.doubles];

    /* If contract doubled and declarer vulnerable, they get double the points */
    if (deal.contract.doubles && this.play.isVulnerable(deal.declarer)) points *= 2;

    this.sides[deal.declarer].above.push({
      title: "Overtrick Bonus",
      desc: "Points awarded for overtricks",
      points,
      deal,
    });
  }

  private scoreSlamBonus(deal: Deal): void {
    if (!deal.won()) return;
    const vulnerableIdx = this.play.isVulnerable(deal.declarer) ? 1 : 0;

    if (deal.contract.level === 6) {
      // Small slam
      this.sides[deal.declarer].above.push({
        title: "Small Slam",
        desc: "Points awarded for winning a small slam",
        points: SLAM_BONUS[0][vulnerableIdx],
        deal,
      });
    }

    if (deal.contract.level === 7) {
      // Grand slam
      this.sides[deal.declarer].above.push({
        title: "Grand Slam",
        desc: "Points awarded for winning a grand slam",
        points: SLAM_BONUS[1][vulnerableIdx],
        deal,
      });
    }
  }

  private scoreInsults(deal: Deal): void {
    if (deal.contract.doubles === 0) return;
    if (!deal.won()) return;

    this.sides[deal.declarer].above.push({
      title: "Insult Bonus",
      desc: `Points awarded for winning a ${deal.contract.doubles === 1 ? "doubled" : "redoubled"} contract`,
      points: INSULT_POINTS[deal.contract.doubles - 1],
      deal,
    });
  }

  private scoreUndertricks(deal: Deal): void {
    if (deal.won()) return;
    const vulnerableIdx = this.play.isVulnerable(deal.declarer) ? 1 : 0;
    const undertricks = deal.contract.rawTricks() - deal.tricks;

    let points = 0;
    for (let i = 0; i < undertricks; i++) {
      const selector = i === 0 ? 0 : i >= 3 ? 2 : 1;
      points += UNDERTRICK_POINTS[vulnerableIdx][selector][deal.contract.doubles];
    }

    this.sides[otherSide(deal.declarer)].above.push({
      title: "Penalty Bonus",
      desc: `Points awarded for undertricks`,
      points,
      deal,
    });
  }

  private scoreHonorBonus(deal: Deal): void {
    function honorPoints(honors: Honors): number {
      switch (honors) {
        case Honors.Partial:
          return 100;
        case Honors.Full:
          return 150;
      }
    }

    for (const side of Object.values(Side)) {
      if (deal.honors[side]) {
        this.sides[side].above.push({
          title: "Honor Bonus",
          desc: `Points awarded for holding ${
            deal.honors[side] === Honors.Partial ? "four of the five" : "all five"
          } honors`,
          points: honorPoints(deal.honors[side]),
          deal,
        });
      }
    }
  }

  private scoreRubberBonus(deal: Deal): void {
    const wins = this.play.games.filter((game) => game.winner() === deal.declarer).length;
    if (wins < 2) return;
    const vulnerableIdx = this.play.isVulnerable(otherSide(deal.declarer)) ? 0 : 1;
    this.sides[deal.declarer].above.push({
      title: "Rubber Bonus",
      desc: `Points awarded for a ${vulnerableIdx === 0 ? "slow" : "fast"} rubber`,
      points: RUBBER_POINTS[vulnerableIdx],
      deal,
    });

    this.play.completed = true;
  }
}

/** Represents a single side's scoring state within a game. */
export class GameSide {
  /** Above the line bonus points awarded during play */
  above: Bonus[];
  /** Below the line contract points awarded during play */
  below: Bonus[];

  contractPoints() {
    return this.below.reduce((acc, bonus) => acc + bonus.points, 0);
  }

  bonusPoints() {
    return this.above.reduce((acc, bonus) => acc + bonus.points, 0);
  }

  constructor() {
    this.above = [];
    this.below = [];
  }
}

export type Bonus = {
  title: React.ReactNode;
  desc: React.ReactNode;
  points: number;
  deal: Deal;
};
