import { tags } from "typia";

export type SmallPositiveNumber = number & tags.Minimum<0> & tags.Maximum<999>;
export type PositiveNumber = number & tags.Minimum<0> & tags.Maximum<99999999>;

export type ShortString = string & tags.MinLength<1> & tags.MaxLength<99>;

export type DateString = string &
  tags.Pattern<"((?:19|20)\\d\\d)-(0?[1-9]|1[012])-([12][0-9]|3[01]|0?[1-9])">;

export type PhotoUrl = string &
  tags.Pattern<`(http)?s?:([a-zA-Z\-_0-9\/\:\.]*\.(png|jpg|jpeg|gif|png|svg))`>;

export type HexColor = string & tags.Pattern<`^#(?:[0-9a-fA-F]{3}){1,2}$`>;
