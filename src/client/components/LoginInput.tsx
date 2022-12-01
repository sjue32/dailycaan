import React, { useState } from 'react';
import { LoginInputProps } from '../../types';

 const LoginInput = (props: LoginInputProps) => {
  const { id, value, onChange, loginInputData } = props;
  const { name, type, placeholder, pattern, errorMessage, required, htmlFor } = loginInputData;

  const [ focused, setFocused ] = useState<boolean>(false);

  const handleFocus = () => {
    setFocused(true);
  }

  return(
    <div className="loginInputGroup">
      <label htmlFor={htmlFor}>{placeholder}</label>
      <input 
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        pattern={pattern}
        required={required}
        data-focused={focused.toString()}
        onChange={onChange}
        onBlur={handleFocus}
      />
      <span>{errorMessage}</span>
    </div>
  )

 };

 export default LoginInput;