import { log } from '@graphprotocol/graph-ts';
import {
  BeanCreated as BeanCreatedEvent,
} from './types/BeansToken/BeansToken';
import {  BeanCreated  } from './types/schema';


export function handleBeanCreated(event: BeanCreatedEvent): void {
  let entity = new BeanCreated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.typeRef = event.params.typeRef
  entity.save()
}
