import loadable from '@loadable/component';

import type { IconComponentProps } from './Icon';

const IconComp = loadable(() => import('./Icon'));

// @ts-ignore
const Icon = (props: IconComponentProps) => <IconComp {...props} />;

export default Icon;
