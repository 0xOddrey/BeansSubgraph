import { log } from '@graphprotocol/graph-ts'
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  BeanBurned as BeanBurnedEvent,
  BeanCreated as BeanCreatedEvent,
  BeanteamDAOUpdated as BeanteamDAOUpdatedEvent,
  DelegateChanged as DelegateChangedEvent,
  DelegateVotesChanged as DelegateVotesChangedEvent,
  DescriptorLocked as DescriptorLockedEvent,
  DescriptorUpdated as DescriptorUpdatedEvent,
  MinterLocked as MinterLockedEvent,
  MinterUpdated as MinterUpdatedEvent,
  OgBeanMinted as OgBeanMintedEvent,
  SeederLocked as SeederLockedEvent,
  SeederUpdated as SeederUpdatedEvent,
  Transfer as TransferEvent
} from "./types/BeansToken/BeansToken"
import {
  Approval,
  ApprovalForAll,
  BeanBurned,
  BeanCreated,
  BeanteamDAOUpdated,
  DelegateChanged,
  DelegateVotesChanged,
  DescriptorLocked,
  DescriptorUpdated,
  MinterLocked,
  MinterUpdated,
  OgBeanMinted,
  SeederLocked,
  SeederUpdated,
  Transfer,
  Bean
} from "./types/schema"
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from './utils/constants';
import { getGovernanceEntity, getOrCreateDelegate, getOrCreateAccount } from './utils/helpers';


export function handleApproval(event: ApprovalEvent): void {
  let entity = new Approval(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId
  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved
  entity.save()
}

export function handleBeanBurned(event: BeanBurnedEvent): void {
  let entity = new BeanBurned(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.save()
}


export function handleBeanCreated(event: BeanCreatedEvent): void {
  let nounId = event.params.tokenId.toString();

  let noun = Bean.load(nounId);
  if (noun == null) {
    log.error('[handleNounCreated] Noun #{} not found. Hash: {}', [
      nounId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  noun.save();
}


let accountNouns: string[] = []; // Use WebAssembly global due to lack of closure support
export function handleDelegateChanged(event: DelegateChangedEvent): void {
  let tokenHolder = getOrCreateAccount(event.params.delegator.toHexString());
  let previousDelegate = getOrCreateDelegate(event.params.fromDelegate.toHexString());
  let newDelegate = getOrCreateDelegate(event.params.toDelegate.toHexString());
  accountNouns = tokenHolder.beans;

  tokenHolder.delegate = newDelegate.id;
  tokenHolder.save();

  previousDelegate.tokenHoldersRepresentedAmount =
    previousDelegate.tokenHoldersRepresentedAmount - 1;
  let previousNounsRepresented = previousDelegate.nounsRepresented; // Re-assignment required to update array
  previousDelegate.nounsRepresented = previousNounsRepresented.filter(
    n => !accountNouns.includes(n),
  );
  newDelegate.tokenHoldersRepresentedAmount = newDelegate.tokenHoldersRepresentedAmount + 1;
  let newNounsRepresented = newDelegate.nounsRepresented; // Re-assignment required to update array
  for (let i = 0; i < accountNouns.length; i++) {
    newNounsRepresented.push(accountNouns[i]);
  }
  newDelegate.nounsRepresented = newNounsRepresented;
  previousDelegate.save();
  newDelegate.save();
}


export function handleBeanteamDAOUpdated(event: BeanteamDAOUpdatedEvent): void {
  let entity = new BeanteamDAOUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.beanteamDAO = event.params.beanteamDAO
  entity.save()
}


export function handleDelegateVotesChanged(event: DelegateVotesChangedEvent): void {
  let governance = getGovernanceEntity();
  let delegate = getOrCreateDelegate(event.params.delegate.toHexString());
  let votesDifference = event.params.newBalance - event.params.previousBalance;

  delegate.delegatedVotesRaw = event.params.newBalance;
  delegate.delegatedVotes = event.params.newBalance;
  delegate.save();

  if (event.params.previousBalance == BIGINT_ZERO && event.params.newBalance > BIGINT_ZERO) {
    governance.currentDelegates = governance.currentDelegates + BIGINT_ONE;
  }
  if (event.params.newBalance == BIGINT_ZERO) {
    governance.currentDelegates = governance.currentDelegates - BIGINT_ONE;
  }
  governance.delegatedVotesRaw = governance.delegatedVotesRaw + votesDifference;
  governance.delegatedVotes = governance.delegatedVotesRaw;
  governance.save();
}



export function handleDescriptorLocked(event: DescriptorLockedEvent): void {
  let entity = new DescriptorLocked(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )

  entity.save()
}

export function handleDescriptorUpdated(event: DescriptorUpdatedEvent): void {
  let entity = new DescriptorUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.descriptor = event.params.descriptor
  entity.save()
}

export function handleMinterLocked(event: MinterLockedEvent): void {
  let entity = new MinterLocked(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )

  entity.save()
}

export function handleMinterUpdated(event: MinterUpdatedEvent): void {
  let entity = new MinterUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.minter = event.params.minter
  entity.save()
}

export function handleOgBeanMinted(event: OgBeanMintedEvent): void {
  let entity = new OgBeanMinted(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.tokenId = event.params.tokenId
  entity.ogBeanAddy = event.params.ogBeanAddy
  entity.save()
}


export function handleSeederLocked(event: SeederLockedEvent): void {
  let entity = new SeederLocked(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )

  entity.save()
}

export function handleSeederUpdated(event: SeederUpdatedEvent): void {
  let entity = new SeederUpdated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.seeder = event.params.seeder
  entity.save()
}

let transferredNounId: string; // Use WebAssembly global due to lack of closure support

export function handleTransfer(event: TransferEvent): void {
  let fromHolder = getOrCreateAccount(event.params.from.toHexString());
  let toHolder = getOrCreateAccount(event.params.to.toHexString());
  let governance = getGovernanceEntity();
  transferredNounId = event.params.tokenId.toString();

  // fromHolder
  if (event.params.from.toHexString() == ZERO_ADDRESS) {
    governance.totalTokenHolders = governance.totalTokenHolders + BIGINT_ONE;
    governance.save();
  } else {
    let fromHolderPreviousBalance = fromHolder.tokenBalanceRaw;
    fromHolder.tokenBalanceRaw = fromHolder.tokenBalanceRaw - BIGINT_ONE;
    fromHolder.tokenBalance = fromHolder.tokenBalanceRaw;
    let fromHolderNouns = fromHolder.beans; // Re-assignment required to update array
    fromHolder.beans = fromHolderNouns.filter(n => n !== transferredNounId);



    if (fromHolder.tokenBalanceRaw < BIGINT_ZERO) {
      log.error('Negative balance on holder {} with balance {}', [
        fromHolder.id,
        fromHolder.tokenBalanceRaw.toString(),
      ]);
    }

    if (fromHolder.tokenBalanceRaw == BIGINT_ZERO && fromHolderPreviousBalance > BIGINT_ZERO) {
      governance.currentTokenHolders = governance.currentTokenHolders - BIGINT_ONE;
      governance.save();

      fromHolder.delegate = null;
    } else if (
      fromHolder.tokenBalanceRaw > BIGINT_ZERO &&
      fromHolderPreviousBalance == BIGINT_ZERO
    ) {
      governance.currentTokenHolders = governance.currentTokenHolders + BIGINT_ONE;
      governance.save();
    }

    fromHolder.save();
  }

  // toHolder
  if (event.params.to.toHexString() == ZERO_ADDRESS) {
    governance.totalTokenHolders = governance.totalTokenHolders - BIGINT_ONE;
    governance.save();
  }

  let toHolderDelegate = getOrCreateDelegate(toHolder.id);
  let toHolderNounsRepresented = toHolderDelegate.nounsRepresented; // Re-assignment required to update array
  toHolderNounsRepresented.push(transferredNounId);
  toHolderDelegate.nounsRepresented = toHolderNounsRepresented;
  toHolderDelegate.save();

  let toHolderPreviousBalance = toHolder.tokenBalanceRaw;
  toHolder.tokenBalanceRaw = toHolder.tokenBalanceRaw + BIGINT_ONE;
  toHolder.tokenBalance = toHolder.tokenBalanceRaw;
  toHolder.totalTokensHeldRaw = toHolder.totalTokensHeldRaw + BIGINT_ONE;
  toHolder.totalTokensHeld = toHolder.totalTokensHeldRaw;
  let toHolderNouns = toHolder.beans; // Re-assignment required to update array
  toHolderNouns.push(event.params.tokenId.toString());
  toHolder.beans = toHolderNouns;

  if (toHolder.tokenBalanceRaw == BIGINT_ZERO && toHolderPreviousBalance > BIGINT_ZERO) {
    governance.currentTokenHolders = governance.currentTokenHolders - BIGINT_ONE;
    governance.save();
  } else if (toHolder.tokenBalanceRaw > BIGINT_ZERO && toHolderPreviousBalance == BIGINT_ZERO) {
    governance.currentTokenHolders = governance.currentTokenHolders + BIGINT_ONE;
    governance.save();

    toHolder.delegate = toHolder.id;
  }

  let noun = Bean.load(transferredNounId);
  if (noun == null) {
    noun = new Bean(transferredNounId);
  }

  noun.owner = toHolder.id;
  noun.save();

  toHolder.save();
}
