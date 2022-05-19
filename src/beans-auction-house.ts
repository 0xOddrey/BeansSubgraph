import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  AuctionCreated as AuctionCreatedEvent,
} from './types/BeansAuctionHouse/BeansAuctionHouse';
import { AuctionCreated } from './types/schema';

export function handleAuctionCreated(event: AuctionCreatedEvent): void {
  let entity = new AuctionCreated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.nounId = event.params.nounId
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime
  entity.save()
}


