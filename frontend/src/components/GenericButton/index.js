import './styles.css';

export function GenericButton({ children, onClick }) {
  return (
    <button className='genericButton' onClick={onClick}>
      {children}
    </button>
  );
}
