type Props = {
  className?: string;
};

const Skeleton = ({ className }: Props) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-md ${className || ''}`}
    />
  );
};

export default Skeleton;
