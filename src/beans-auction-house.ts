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
  Unpaused
} from "./types/schema"


export function handleAuctionCreated(event: AuctionCreatedEvent): void {
  let entity = new AuctionCreated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.nounId = event.params.nounId
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime
  entity.save()
}

export function handleAuctionBid(event: AuctionBidEvent): void {
  let entity = new AuctionBid(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.nounId = event.params.nounId
  entity.sender = event.params.sender
  entity.value = event.params.value
  entity.extended = event.params.extended
  entity.save()
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

