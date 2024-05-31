import styled, { RuleSet, css, keyframes } from 'styled-components';
import Icon from './Icon';

export enum SyncStatusEnum {
  Loading = 'loading',
  Loaded = 'loaded',
  Failed = 'failed',
}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const styleByStatus: Record<SyncStatusEnum, RuleSet<object>> = {
  [SyncStatusEnum.Loading]: css`
    animation: ${rotate} 2s linear infinite;
  `,
  [SyncStatusEnum.Loaded]: css``,
  [SyncStatusEnum.Failed]: css``,
};

const StyledContainer = styled.div<{ $status: SyncStatusEnum }>`
  position: fixed;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) => styleByStatus[props.$status]}
`;

type SyncProps = {
  status: SyncStatusEnum;
};

export const Sync = ({ status }: SyncProps) => {
  if (status === SyncStatusEnum.Loading) {
    return (
      <StyledContainer $status={status}>
        <Icon name="RefreshCw" color="#848484" size={16} />
      </StyledContainer>
    );
  }

  if (status === SyncStatusEnum.Loaded) {
    return (
      <StyledContainer $status={status}>
        <Icon name="Check" color="green" size={24} />
      </StyledContainer>
    );
  }
  return (
    <StyledContainer $status={status}>
      <Icon name="XCircle" color="red" size={24} />
    </StyledContainer>
  );
};
