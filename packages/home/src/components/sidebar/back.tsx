import { css } from '@emotion/css';
import usePage from '~/hooks/usePage';

const styles = {
  button: css({
    position: 'absolute',
    top: '6rem',
    cursor: 'pointer',
    color: '#FFFFFF',
    background: 'none',
    fontSize: '1.5rem',
    '@media screen and (max-width: 860px)': {
      top: '1.5rem',
      left: '1.5rem',
      fontSize: '1rem',
    },
  }),
};

const Back: React.FC = () => {
  const { reset } = usePage();

  return (
    <button type="button" className={styles.button} onClick={reset}>
      &lt; BACK
    </button>
  );
};
export default Back;
