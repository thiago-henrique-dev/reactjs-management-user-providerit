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
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ marginBottom: '70px' }}>
                    <img style={{
                        background: 'linear-gradient(45deg, rgb(92, 15,221), rgb(105, 28, 237))', marginLeft: '50px',
                        padding: '20px'}}
                        src={logo}
                        alt="Logo"/>
                    <h1 style={{
                            marginTop: '20px',
                            marginBottom: '25px',
                            padding: '12px 12px',
                            color: 'white',
                            background: 'linear-gradient(45deg, rgb(92, 15,221), rgb(105, 28, 237))',
                            fontSize: '16px',
                            fontWeight: 'bold'}}>
                        Portal de Administração de Usuários
                    </h1>
                    <div style={{ marginBottom: '25px' }}>
                        <span className="p-float-label">
                            <InputText
                                type="email"
                                id="email"
                                value={email}
                                onChange={handleChange}
                                onFocus={() => handleFocus('email')}
                                style={{
                                    width: '300px',
                                    border: emailError || 
                                                (formSubmitted && !email) ? 
                                                            '1px solid red' : '1px solid #ced4da'}}/>
                            <label style={{ fontWeight: 'bold' }}>E-mail</label>
                        </span>
                        {formSubmitted && !email && (
                            <p style={{ marginTop: '5px', fontSize: '12px', color: 'red', fontWeight: 'bold' }}>
                                Digite um e-mail válido.
                            </p>)}
                    </div>
                    <div style={{ marginTop: '25px' }}>
                        <span className="p-float-label">
                            <InputText
                                type="password"
                                id="password"
                                value={password}
                                onChange={handleChange}
                                onFocus={() => handleFocus('password')}
                                style={{ width: '300px',
                                    border: passwordError || 
                                                (formSubmitted && 
                                                    !password) ? '1px solid red' : '1px solid #ced4da'}}/>
                            <label style={{ fontWeight: 'bold' }}>Password</label>
                        </span>
                        {formSubmitted && !password && (
                            <p style={{ marginTop: '5px', fontSize: '12px', color: 'red', fontWeight: 'bold' }}>
                                {errorMessages.password}
                            </p>)}
                    </div>
                    <div style={{ marginTop: '25px' }}>
                        <span className="p-float-label">
                            <InputText
                                type="password"
                                id="passwordConfirmation"
                                value={passwordConfirmation}
                                onChange={handleChange}
                                onFocus={() => handleFocus('passwordConfirmation')}
                                style={{
                                    width: '300px',
                                    border: confirmationError || 
                                                (formSubmitted && 
                                                    !passwordConfirmation) ? 
                                                        '1px solid red' : '1px solid #ced4da'}}/>
                            <label style={{ fontWeight: 'bold' }}>Confirm password</label>
                        </span>
                        {formSubmitted && !passwordConfirmation && (
                            <p style={{ marginTop: '5px', fontSize: '12px', color: 'red', fontWeight: 'bold' }}>
                                {errorMessages.passwordConfirmation}
                            </p>)}
                    </div>
                    <Button
                        onClick={handleRegister}
                        style={{
                            background: 'linear-gradient(45deg, rgb(92, 15,221), rgb(105, 28, 237))',
                            width: '100%',
                            maxWidth: '300px',
                            marginTop: '10px' }}>
                        <span style={{ margin: 'auto', fontWeight: 'bold' }}>Cadastrar</span>
                    </Button>
                    {emailNotFound && (
                        <p style={{ marginLeft: '80px', marginTop: '20px', fontSize: '14px', color: 'red', fontWeight: 'bold' }}>
                            {emailNotFound}
                        </p>)}
                    <div style={{ marginTop: '20px' }}>
                        <Link style={{ fontWeight: 'bold', textDecoration: 'none', marginLeft: '80px' }}
                            to="/">
                            Login! Clique aqui.
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
