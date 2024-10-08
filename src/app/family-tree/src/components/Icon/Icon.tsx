import React from 'react';
import * as FIcon from 'react-feather';
import { IconProps } from 'react-feather';

export type IconComponentProps = {
  name: keyof typeof FIcon;
} & IconProps;

const Icon = ({ name, size = 16, ...props }: IconComponentProps) => {
  const FeatherIcon = FIcon[name];
  return (
    <>
      <FeatherIcon size={size} {...props} />
    </>
  );
};

export default Icon;
