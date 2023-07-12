import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { auth, db } from '../../services/Firebase'
import alertify from "alertifyjs";
import { Link } from "react-router-dom";
import logo from '../../assets/logo.svg'
import { signInWithEmailAndPassword } from "firebase/auth";

import { collection, getDocs, where, query } from 'firebase/firestore';
import './Login.css'

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
            alertify.error("E-mail ou senha inválido.", { id: 'alertify-notifier' });
        }

        if (password.length < 8) {
            setPasswordError('A senha precisa ter pelo menos 8 dígitos');
            alertify.error("A senha precisa ter no mínimo 8 caracteres", { id: 'alertify-notifier' });
            return;
        }

        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
        
            const adminRef = collection(db, 'admin');
            const q = query(adminRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
        
            if (!querySnapshot.empty) {
                const adminData = querySnapshot.docs[0].data();
                const name = adminData.name;
        
                localStorage.setItem('detailUser', JSON.stringify({ name, email }));
        
                console.log('Dados salvos com sucesso no localStorage!');
                navigate('/admin');
            } else {
                setEmailNotFound('Email não cadastrado!');
            }
        
            alertify.success("Login realizado com sucesso!", { id: 'alertify-notifier' });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setEmailNotFound('Email não cadastrado!');
            } else {
                alertify.error("Erro ao fazer login:", error, {
                    id: 'alertify-notifier'
                });
            }
        }
        
        
    };

    const emailIsValid = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    return (
        <div className="container">
        <div className="content">
          <img className="logo" src={logo} alt="Logo"></img>
          <h1 className="title">Painél de Administração de Usuários</h1>
          <div className="form-group">
            <span className="p-float-label">
              <InputText
                type="email"
                id="email"
                value={email}
                onChange={handleChange}
                className={emailError ? 'error' : ''}
                style={{ width: '400px'}}
              />
              <label className="label">E-mail</label>
            </span>
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
          <div className="form-group">
            <span className="p-float-label">
              <InputText
                type="password"
                id="password"
                value={password}
                onChange={handleChange}
                className={passwordError ? 'error' : ''}
                style={{ width: '400px'}}
              />
              <label className="label">Password</label>
            </span>
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
          <Button onClick={handleSubmit} className="login-button"
            style={{background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))'}}>
            <span className="button-text">Login</span>
          </Button>
          {emailNotFound && <p className="error-message">{emailNotFound}</p>}
          <div className="register-link">
            <Link to="/register" className="link">
              Não tem uma conta? <br />
              Registre-se agora mesmo e junte-se ao nosso painél.
            </Link>
          </div>
        </div>
      </div>
      
    );
};

