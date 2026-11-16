import { css } from '@emotion/css';

const styles = {
  page: css({
    display: 'flex',
    position: 'relative',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden',
  }),
};

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className={styles.page}>{children}</section>
);

export default Page;
