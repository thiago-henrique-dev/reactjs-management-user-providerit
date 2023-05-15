import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { auth } from '../../services/Firebase'
import alertify from "alertifyjs";
import { Link } from "react-router-dom";
import logo from '../../assets/logo.svg'
import { signInWithEmailAndPassword } from "firebase/auth";
import './index.css'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [emailNotFound, setEmailNotFound] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    const navigate = useNavigate();

    const handleChange = (event) => {
        const { id, value } = event.target;

        switch (id) {
            case "email":
                setEmail(value);
                setEmailError('');
                break;
            case "password":
                setPassword(value);
                setPasswordError('');
                break;
            default:
                break;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormSubmitted(true);

        if (!emailIsValid(email)) {
            setEmailError('Email inválido');
            alertify.error("E-mail ou senha inválido.",
              { id: 'alertify-notifier' });
        }
      
        if (password.length < 8) {
            setPasswordError('A senha precisa ter pelo menos 8 dígitos');
            alertify.error("A senha precisa ter no mínimo 8 caracteres",
            { id: 'alertify-notifier' });
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/admin", { replace: true });
            alertify.success("Login realizado com sucesso!", { id: 'alertify-notifier' });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setEmailNotFound('Email não cadastrado!');
            } else {
                alertify.error("Erro ao fazer login:", error, { id: 'alertify-notifier' });
            }
        }
    };

    const emailIsValid = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ marginBottom: '100px' }}>
                    <img style={{ background: 'linear-gradient(45deg, rgb(92, 15,221), rgb(105, 28, 237))', marginLeft: '50px', padding: '20px' }}
                        src={logo}></img>
                    <h1 style={{ marginTop: '50px', marginBottom: '25px',
                        padding: '12px 12px', color: 'white', background: 'linear-gradient(45deg, rgb(92, 15,221), rgb(105, 28, 237))',
                        fontSize: '16px', fontWeight: 'bold'
                    }}>Portal de Administração de Usuários</h1>
                    <div  style={{ marginBottom: '25px' }}>
                        <span className="p-float-label">
                        <InputText
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleChange}
                            style={{
                                width: '300px',
                                border: emailError ? '1px solid red' : '1px solid #ced4da'
                              }}/>
                        <label style={{ fontWeight: 'bold'}}>E-mail</label>
                        </span>
                        {emailError && <p style={{ marginTop: '5px', fontSize: '12px', color: 'red', fontWeight: 'bold' }}>{emailError}</p>}
                    </div>
                    <div style={{ marginTop: '25px'}}>
                        <span className="p-float-label">
                        <InputText
                            type="password"
                            id="password"
                            value={password}
                            onChange={handleChange}
                            style={{
                                width: '300px',
                                border: passwordError ? 
                                            '1px solid red' : '1px solid #ced4da'
                              }}/>
                        <label style={{ fontWeight: 'bold'}}>Password</label>
                        </span>
                        {passwordError && <p style={{ marginTop: '5px', fontSize: '12px', color: 'red', fontWeight: 'bold' }}>{passwordError}</p>}
                    </div>
                    <Button onClick={handleSubmit} style={{
                        background: 'linear-gradient(45deg, rgb(92, 15,221), rgb(105, 28, 237))',
                        width: '100%',
                        maxWidth: '300px',
                        marginTop: '10px'}}>
                        <span style={{ margin: 'auto' }}><span style={{ fontWeight: 'bold'}}>Login</span></span>
                    </Button>
                    {emailNotFound && <p style={{ marginLeft: '80px', marginTop: '20px', fontSize: '14px', color: 'red', fontWeight: 'bold' }}>{emailNotFound}</p>}
                    <div style={{ marginTop: '20px' }}>
                        <Link style={{ fontWeight: 'bold', textDecoration: 'none',  marginLeft: '80px' }} to="/register">Registre-se! Clique aqui.</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

