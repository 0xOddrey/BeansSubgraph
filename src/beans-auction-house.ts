import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  AuctionBid as AuctionBidEvent,
  AuctionCreated as AuctionCreatedEvent,
  AuctionExtended as AuctionExtendedEvent,
  AuctionMinBidIncrementPercentageUpdated as AuctionMinBidIncrementPercentageUpdatedEvent,
  AuctionReservePriceUpdated as AuctionReservePriceUpdatedEvent,
  AuctionSettled as AuctionSettledEvent,
  AuctionTimeBufferUpdated as AuctionTimeBufferUpdatedEvent,
  Paused as PausedEvent,
  Unpaused as UnpausedEvent
} from "./types/BeansAuctionHouse/BeansAuctionHouse"
import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionMinBidIncrementPercentageUpdated,
  AuctionReservePriceUpdated,
  AuctionSettled,
  AuctionTimeBufferUpdated,
  Paused,
  Auction,
  Bid,
  Unpaused,
  Bean
} from "./types/schema"
import { getGovernanceEntity, getOrCreateDelegate, getOrCreateAccount } from './utils/helpers';
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from './utils/constants';

export function handleAuctionCreated(event: AuctionCreatedEvent): void {
  let beanId = event.params.nounId.toString();

  let bean = Bean.load(beanId);
  if (bean == null) {

    return;
  }

  let auction = new Auction(beanId);
  auction.bean = bean.id;
  auction.amount = BigInt.fromI32(0);
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  auction.settled = false;
  auction.save();


}

export function handleAuctionBid(event: AuctionBidEvent): void {
  let nounId = event.params.nounId.toString();
  let bidderAddress = event.params.sender.toHex();

  let bidder = getOrCreateAccount(bidderAddress);

  let auction = Auction.load(nounId);
  if (auction == null) {
    return;
  }

  auction.amount = event.params.value;
  auction.bidder = bidder.id;
  auction.save();

  // Save Bid
  let bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.bean = auction.bean;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}

export function handleAuctionExtended(event: AuctionExtendedEvent): void {
  let entity = new AuctionExtended(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.nounId = event.params.nounId
  entity.endTime = event.params.endTime
  entity.save()
}

export function handleAuctionMinBidIncrementPercentageUpdated(
  event: AuctionMinBidIncrementPercentageUpdatedEvent
): void {
  let entity = new AuctionMinBidIncrementPercentageUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.minBidIncrementPercentage = event.params.minBidIncrementPercentage
  entity.save()
}

export function handleAuctionReservePriceUpdated(
  event: AuctionReservePriceUpdatedEvent
): void {
  let entity = new AuctionReservePriceUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.reservePrice = event.params.reservePrice
  entity.save()
}

export function handleAuctionSettled(event: AuctionSettledEvent): void {
  let entity = new AuctionSettled(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.nounId = event.params.nounId
  entity.winner = event.params.winner
  entity.amount = event.params.amount
  entity.save()
}

export function handleAuctionTimeBufferUpdated(
  event: AuctionTimeBufferUpdatedEvent
): void {
  let entity = new AuctionTimeBufferUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.timeBuffer = event.params.timeBuffer
  entity.save()
}


export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.account = event.params.account
  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.account = event.params.account
  entity.save()
}

