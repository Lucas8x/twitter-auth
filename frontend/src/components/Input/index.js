import './styles.css';

export function Input({ text, ...props }) {
  return (
    <div className='inputContainer'>
      <span className='text'>{text}</span>
      <input {...props} className='input' />
    </div>
  );
}
