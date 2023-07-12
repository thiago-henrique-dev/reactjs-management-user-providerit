import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { auth } from '../../services/Firebase'
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import alertify from "alertifyjs";
import logo from '../../assets/logo.svg'
import './index.css'

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [emailNotFound, setEmailNotFoud] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmationError, setConfirmationError] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const errorMessages = {
        email: 'O campo e-mail é obrigatório!',
        password: 'O campo senha é obrigatório!',
        passwordConfirmation: 'O campo confirmação de senha é obrigatório!',
    };

    const navigate = useNavigate();

    const handleChange = (event) => {
        const { id, value } = event.target;

        switch (id) {
            case "email":
                setEmail(value);
                break;
            case "password":
                setPassword(value);
                break;
            case "passwordConfirmation":
                setPasswordConfirmation(value);
                break;
            default:
                break;
        }
    };

    const handleFocus = (field) => {
        if (field === "email") {
            setEmailError(false);
        } else if (field === "password") {
            setPasswordError(false);
        } else if (field === "passwordConfirmation") {
            setConfirmationError(false);
        }
    };

    async function handleRegister(e) {
        e.preventDefault();
        setFormSubmitted(true);
      
        const emailIsValid = (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        };
      
        if (!email || !password || password.length < 8 || password !== passwordConfirmation) {
          if (!email || !password) {
            setEmailError(true);
            setPasswordError(true);
            alertify.error("E-mail ou senha inválido.", { id: 'alertify-notifier' });
          }
      
          if (password.length < 8) {
            setPasswordError(true);
            alertify.error("A senha precisa ter no mínimo 8 caracteres", { id: 'alertify-notifier' });
          }
      
          if (password !== passwordConfirmation) {
            setPasswordError(true);
            setConfirmationError(true);
            alertify.error("As senhas não correspondem", { id: 'alertify-notifier' });
          }
      
          if (!emailIsValid(email)) {
            setEmailError(true);
            alertify.error("Digite um e-mail válido.", { id: 'alertify-notifier' });
          }
          return;
        }
      
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log(auth, email, password, "auth")
          navigate("/info", { replace: true });
          alertify.success("Registro realizado com sucesso!", { id: 'alertify-notifier' });
        } catch (error) {
          alertify.error("Erro ao fazer o registro:", error, { id: 'alertify-notifier' });
        }
      }
      
    return (
        <div className="container">
        <div className="content">
            <img className="logo" src={logo} alt="Logo" />
            <h1 className="title">Portal de Administração de Usuários</h1>
            <div className="form-field">
                <span className="p-float-label">
                    <InputText
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleChange}
                        onFocus={() => handleFocus('email')}
                        className={`input ${emailError || (formSubmitted && !email) ? 'error' : ''}`}
                        style={{ width: '450px'}}
                    />
                    <label className="label">E-mail</label>
                </span>
                {formSubmitted && !email && (
                    <p className="error-message">Digite um e-mail válido.</p>
                )}
            </div>
            <div className="form-field">
                <span className="p-float-label">
                    <InputText
                        type="password"
                        id="password"
                        value={password}
                        onChange={handleChange}
                        onFocus={() => handleFocus('password')}
                        className={`input ${passwordError || (formSubmitted && !password) ? 'error' : ''}`}
                        style={{ width: '450px'}}
                    />
                    <label className="label">Password</label>
                </span>
                {formSubmitted && !password && (
                    <p className="error-message">{errorMessages.password}</p>
                )}
            </div>
            <div className="form-field">
                <span className="p-float-label">
                    <InputText
                        type="password"
                        id="passwordConfirmation"
                        value={passwordConfirmation}
                        onChange={handleChange}
                        onFocus={() => handleFocus('passwordConfirmation')}
                        className={`input ${confirmationError || (formSubmitted && !passwordConfirmation) ? 'error' : ''}`}
                        style={{ width: '450px'}}
                    />
                    <label className="label">Confirm password</label>
                </span>
                {formSubmitted && !passwordConfirmation && (
                    <p className="error-message">{errorMessages.passwordConfirmation}</p>
                )}
            </div>
            <Button
                onClick={handleRegister}
                className="register-button"
                style={{background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))'}}
            >
                <span className="button-text">Cadastrar</span>
            </Button>
            {emailNotFound && (
                <p className="error-message">{emailNotFound}</p>
            )}
            <div className="login-link">
                <Link to="/" className="link-text"> Se você possui uma conta, clique aqui e <br />
              faça login agora mesmo e junte-se ao nosso painel.</Link>
            </div>
        </div>
    </div>
    
    );
}
