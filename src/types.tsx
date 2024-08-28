import { Typography } from "@mui/material";
import React from "react";

export enum Trump {
  Clubs = 0,
  Diamonds = 1,
  Hearts = 2,
  Spades = 3,
  NoTrump = 4,
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
      <Typography variant="inherit" sx={{ color }} component="span">
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

  rawTricks(): number {
    return this.level + Contract.BOOK_COUNT;
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
}
