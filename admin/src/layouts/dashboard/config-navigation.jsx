import SvgColor from '../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'user',
    path: '/user',
    icon: icon('ic_user'),
  },
  {
    title: 'word',
    path: '/word',
    icon: icon('ic_blog'),
  },
  {
    title: 'feedback',
    path: '/feedback',
    icon: icon('ic_feedback'),
  },
];

export default navConfig;
