import { log } from '@graphprotocol/graph-ts';
import {
  DelegateChanged,
  DelegateVotesChanged,
  BeanCreated,
  Transfer,
} from './types/BeansToken/BeansToken';
import { Bean } from './types/schema';
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from './utils/constants';
import { getGovernanceEntity, getOrCreateDelegate, getOrCreateAccount } from './utils/helpers';

export function handleBeanCreated(event: BeanCreated): void {
  let beanId = event.params.tokenId.toString();


  let noun = Bean.load(beanId);
  if (noun == null) {
    log.error('[handleNounCreated] Noun #{} not found. Hash: {}', [
      beanId,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  noun.save();
}

let accountBeans: string[] = []; // Use WebAssembly global due to lack of closure support
export function handleDelegateChanged(event: DelegateChanged): void {
  let tokenHolder = getOrCreateAccount(event.params.delegator.toHexString());
  let previousDelegate = getOrCreateDelegate(event.params.fromDelegate.toHexString());
  let newDelegate = getOrCreateDelegate(event.params.toDelegate.toHexString());
  accountBeans = tokenHolder.beans;

  tokenHolder.delegate = newDelegate.id;
  tokenHolder.save();

  previousDelegate.tokenHoldersRepresentedAmount =
    previousDelegate.tokenHoldersRepresentedAmount - 1;
  let previousBeansRepresented = previousDelegate.beansRepresented; // Re-assignment required to update array
  previousDelegate.beansRepresented = previousBeansRepresented.filter(
    n => !accountBeans.includes(n),
  );
  newDelegate.tokenHoldersRepresentedAmount = newDelegate.tokenHoldersRepresentedAmount + 1;
  let newBeansRepresented = newDelegate.beansRepresented; // Re-assignment required to update array
  for (let i = 0; i < accountBeans.length; i++) {
    newBeansRepresented.push(accountBeans[i]);
  }
  newDelegate.beansRepresented = newBeansRepresented;
  previousDelegate.save();
  newDelegate.save();
}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
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

let transferredNounId: string; // Use WebAssembly global due to lack of closure support
export function handleTransfer(event: Transfer): void {
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
    let fromHolderBeans = fromHolder.beans; // Re-assignment required to update array
    fromHolder.beans = fromHolderBeans.filter(n => n !== transferredNounId);

    if (fromHolder.delegate != null) {
      let fromHolderDelegate = getOrCreateDelegate(fromHolder.delegate);
      let fromHolderBeansRepresented = fromHolderDelegate.beansRepresented; // Re-assignment required to update array
      fromHolderDelegate.beansRepresented = fromHolderBeansRepresented.filter(
        n => n !== transferredNounId,
      );
      fromHolderDelegate.save();
    }

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
  let toHolderNounsRepresented = toHolderDelegate.beansRepresented; // Re-assignment required to update array
  toHolderNounsRepresented.push(transferredNounId);
  toHolderDelegate.beansRepresented = toHolderNounsRepresented;
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
