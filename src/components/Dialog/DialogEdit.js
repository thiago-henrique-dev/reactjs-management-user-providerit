
import { useState, useEffect } from 'react'
import { db } from '../../services/Firebase'
import { doc, updateDoc } from 'firebase/firestore';
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import axios from 'axios';
import { RadioButton } from 'primereact/radiobutton'
import './index.css'
import alertify from "alertifyjs";
import { formatPhone, formatCPF, validateCPF, formatCEP, errorMessages, formatDatePTBR } from './DialogValidator';

export default function CustomerDialogEdit(props) {
    const { form, setForm } = props;
    const [formFocused, setFormFocused] = useState({
        name: false,
        phone: false,
        cpf: false,
        gender: false,
        birthdate: false,
        cep: false,
        street: false,
        number: false,
        neighborhood: false,
        city: false,
        state: false,
        complement: false,
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isPhoneValid, setIsPhoneValid] = useState(true);
    const [isCPFValid, setIsCPFValid] = useState(true);
    const [isCEPValid, setIsCEPValid] = useState(false);
    const [showCEPError, setShowCEPError] = useState(false);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [fieldError, setFieldError] = useState(false);
    const [isErrorMessagesVisible, setIsErrorMessagesVisible] = useState(false);


    const handleFieldFocus = (fieldName) => {
        setFormFocused({ ...formFocused, [fieldName]: true });
    };

    const handleFieldBlur = (fieldName) => {
        setFormFocused((prevFormFocused) => ({
            ...prevFormFocused,
            [fieldName]: false,
        }));

        if (form[fieldName] === '') {
            setFieldError(true);
        } else {
            setFieldError(false);
        }
    };

    function handleChange(e) {
        const { name, value, type } = e.target;

        if (type === 'radio' && name === 'gender') {
            if (value === 'Outro') {
                setShowOtherInput(true);
                setForm((oldValues) => ({
                    ...oldValues,
                    gender: value,
                    otherGender: oldValues.otherGender || '',
                }));
            } else {
                setShowOtherInput(false);
                setForm((oldValues) => ({
                    ...oldValues,
                    gender: value,
                    otherGender: '',
                }));
            }
        } else if (name === 'phone') {
            const formatValue = formatPhone(value);
            const isValid = formatValue.length === 15;

            setForm((oldValues) => ({
                ...oldValues,
                [name]: formatValue,
            }));
            setIsPhoneValid(isValid);
        } else if (name === 'cpf') {
            const formatValue = formatCPF(value);
            const isValid = validateCPF(value);

            setForm((oldValues) => ({
                ...oldValues,
                [name]: formatValue,
            }));
            setIsCPFValid(isValid);
        } else if (name === 'cep') {
            const formatValue = formatCEP(value);

            setForm((oldValues) => ({
                ...oldValues,
                [name]: formatValue,
            }));
        } else {
            setForm((oldValues) => ({
                ...oldValues,
                [name]: value,
            }));
        }
    }

    useEffect(() => {
        if (form.gender === 'Outro') {
            setShowOtherInput(true);
            setForm((oldValues) => ({
                ...oldValues,
                otherGender: form.otherGender || '',
            }));
        } else {
            setShowOtherInput(false);
        }
    }, []);


    const resetForm = () => {
        setForm({
            name: '',
            phone: '',
            cpf: '',
            gender: '',
            birthdate: '',
            cep: '',
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            complement: '',
        });
        setFormFocused({
            name: false,
            email: false,
            message: false,
        });
        props.onHide()
        setFormSubmitted(false);
        setIsPhoneValid(true)
        setIsCEPValid(false)
        setShowCEPError(false)
        setIsCPFValid(false)
        setShowOtherInput(false)
    };

    async function handleUpdateCustomer(e) {
        e.preventDefault();
        setFormSubmitted(true);

        const requiredFields = [
            { name: 'name', label: 'Nome' },
            { name: 'phone', label: 'Telefone' },
            { name: 'cpf', label: 'CPF' },
            { name: 'birthdate', label: 'Data de Nascimento' },
            { name: 'cep', label: 'CEP' },
            { name: 'street', label: 'Rua' },
            { name: 'number', label: 'Número' },
            { name: 'neighborhood', label: 'Bairro' },
            { name: 'city', label: 'Cidade' },
            { name: 'state', label: 'Estado' },
            { name: 'complement', label: 'Complemento' },
        ];

        // Verificar campos em branco
        let errorMessages = {};
        requiredFields.forEach(field => {
            if (form[field.name].trim() === '') {
                errorMessages[field.name] = `O campo ${field.label} é obrigatório.`;
            }
        });

        if (Object.keys(errorMessages).length > 0) {
            setIsErrorMessagesVisible(true);
            return;
        }

        const isValidCPF = validateCPF(form.cpf);
        if (!isValidCPF) {
            setIsCPFValid(false);
            alertify.error("Por favor, verifique o número do CPF digitado!", { id: 'alertify-notifier' });
            return;
        }

        const docRef = doc(db, 'users', form.id);

        try {
            const formattedDate = formatDatePTBR(form.birthdate);
            form.birthdate = formattedDate;
            await updateDoc(docRef, form);
            alertify.success("Usuário atualizado com sucesso!", { id: 'alertify-notifier' });
            resetForm();
        } catch (error) {
            alertify.error("Erro ao atualizar o usuário!", { id: 'alertify-notifier' });
        }
    }

    const handleSearch = async () => {
        if (form.cep.length !== 9) {
            setIsCEPValid(false);
            setShowCEPError(true);
            return;
        }

        try {
            const response = await axios.get(`https://viacep.com.br/ws/${form.cep}/json/`);

            if (response.data.erro) {
                setIsCEPValid(false);
                setShowCEPError(true);
                return;
            }
            setForm({
                ...form,
                street: response.data.logradouro,
                neighborhood: response.data.bairro,
                city: response.data.localidade,
                state: response.data.uf,
            });
            setIsCEPValid(true);
            setShowCEPError(false);
        } catch (error) {
            console.error(error);
            setForm({
                ...form,
                street: '',
                neighborhood: '',
                city: '',
                state: '',
            });
            setIsCEPValid(false);
            setShowCEPError(true);
        }
    };

    return (
        <Dialog visible={props.visible} onHide={resetForm}>
            <form onSubmit={handleUpdateCustomer} noValidate style={{overflow: 'hidden'}}
                className="form__registration">
                <h1 className='form__title'>Ficha cadastrada por {form.userAdmin}
                    <p style={{ fontSize: '8px', color: 'black', fontWeight: 'bold', marginTop: '5px' }}>E-mail do usuário: {form.emailAdmin}</p>
                </h1>
                <div className="input-group">
                    <h1 className='form__address' style={{ marginLeft: '300px' }}>Dados do cliente</h1>
                    <div style={{ display: 'flex' }}>
                        <div>
                            <div>
                                <span className="p-float-label">
                                    <InputText
                                        id="inputText"
                                        name="name"
                                        style={{
                                            marginRight: '5px',
                                            border: fieldError && formSubmitted && form.name === '' ? '1px solid red' : '1px solid #ccc'
                                        }}
                                        value={form.name}
                                        onChange={handleChange}
                                        onFocus={() => handleFieldFocus('name')}
                                        onBlur={() => handleFieldBlur('name')}
                                    />
                                    <label style={{ fontWeight: 'bold' }}>Nome</label>
                                </span>
                                {isErrorMessagesVisible && formSubmitted && form.name === '' && !formFocused.name && (
                                    <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                        {errorMessages.name}
                                    </div>)}
                            </div>
                        </div>
                        <div className="form__group">
                            <span className="p-float-label">
                                <InputText
                                    id="inputText"
                                    name="phone"
                                    style={{
                                        marginRight: '5px',
                                        border: fieldError &&
                                            formSubmitted &&
                                            form.phone === '' ?
                                            '1px solid red' : '1px solid #ccc'

                                    }}
                                    value={form.phone}
                                    maxLength="15"
                                    onChange={handleChange}
                                    onFocus={() => handleFieldFocus('phone')}
                                    onBlur={() => handleFieldBlur('phone')} />
                                <label style={{ fontWeight: 'bold' }}>Telefone</label>
                            </span>
                            {isErrorMessagesVisible && 
                                    !formFocused.phone && 
                                            !isPhoneValid && (
                                <div style={{ fontSize: '10px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                    Número de telefone inválido
                                </div>)}
                        </div>
                        <div className="form__group">
                            <span className="p-float-label">
                                <InputText
                                    id="inputText"
                                    name="cpf"
                                    style={{
                                        width: '130px',
                                        marginRight: '5px',
                                        border: fieldError &&
                                            formSubmitted && form.cpf === '' ?
                                            '1px solid red' : '1px solid #ccc'}}
                                    value={form.cpf}
                                    maxLength="14"
                                    onChange={handleChange}
                                    onFocus={() => handleFieldFocus('cpf')}
                                    onBlur={() => handleFieldBlur('cpf')} />
                                <label style={{ fontWeight: 'bold' }}>CPF</label>
                            </span>
                            {isErrorMessagesVisible && formSubmitted && form.cpf === '' && !formFocused.cpf && (
                                <div style={{ fontSize: '10px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                    {errorMessages.cpf}
                                </div>)}
                            {!formFocused.cpf && form.cpf.length > 0 && (
                                <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '5px' }}>
                                    {!isCPFValid && (
                                        <span style={{ fontSize: '10px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                            CPF inválido.
                                        </span>)}
                                    {isCPFValid && (
                                        <span style={{ }}>
                                    
                                            CPF válido.
                                        </span>)}
                                </div>)}
                        </div>
                    </div>
                    <div className="form__group" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="flex-1 marginRight-10">
                            <h1 className='form__address'>Genero</h1>
                            <div style={{ display: 'flex' }}>
                                <RadioButton
                                    inputId="gender1"
                                    name="gender"
                                    value="Masculino"
                                    onChange={handleChange}
                                    onBlur={() => handleFieldBlur('gender')}
                                    onFocus={() => handleFieldFocus('gender')}
                                    checked={form.gender === 'Masculino'} />
                                <label htmlFor="gender1" style={{ fontSize: '14px', marginLeft: '10px', marginRight: '5px' }}>Masculino</label>
                                <RadioButton
                                    inputId="gender2"
                                    name="gender"
                                    value="Feminino"
                                    onChange={handleChange}
                                    onBlur={() => handleFieldBlur('gender')}
                                    onFocus={() => handleFieldFocus('gender')}
                                    checked={form.gender === 'Feminino'} />
                                <label htmlFor="gender2" style={{ fontSize: '14px', marginLeft: '10px', marginRight: '5px' }}>Feminino</label>
                                <RadioButton
                                    inputId="gender3"
                                    name="gender"
                                    value="Outro"
                                    onChange={handleChange}
                                    onBlur={() => handleFieldBlur('gender')}
                                    onFocus={() => handleFieldFocus('gender')}
                                    checked={form.otherGender === 'Outro'} />
                                <label htmlFor="gender3" style={{ fontSize: '14px', marginLeft: '10px', marginRight: '10px' }}>Outros</label>
                                {showOtherInput && (
                                    <div>
                                        <span className="p-float-label">
                                            <InputText
                                                type="text"
                                                name="otherGender"
                                                value={form.otherGender}
                                                onChange={handleChange}
                                                onBlur={handleFieldBlur}
                                                style={{ width: '150px' }} />
                                            <label style={{ fontWeight: 'bold' }}>Gênero</label>
                                        </span>
                                    </div>)}
                            </div>
                            {isErrorMessagesVisible && 
                                            formSubmitted && 
                                                form.gender === '' 
                                                    && !formFocused.gender && (
                                <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                    {errorMessages.gender}
                                </div>)}
                        </div>
                        <div>
                            <span className="p-float-label">

                            <InputText
                                id="birthdate"
                                name="birthdate"
                                style={{
                                    marginLeft: '5px', marginRight: '5px',
                                    border: fieldError &&
                                              formSubmitted &&
                                                   form.birthdate === '' ?
                                                      '1px solid red' : '1px solid #ccc'}}
                                type="date"
                                defaultValue={form.birthdate}
                                onChange={handleChange}
                                onFocus={() => handleFieldFocus('birthdate')}
                                onBlur={() => handleFieldBlur('birthdate')} />
                                <label style={{ fontWeight: 'bold' }}>Data de nascimento</label>
                                                                    </span>

                            {isErrorMessagesVisible &&
                                             formSubmitted && 
                                                  form.birthdate === ''
                                                        && !formFocused.birthdate && (
                                    <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                        {errorMessages.birthdate}
                                    </div>)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 className='form__address' style={{ fontSize: '14px', marginLeft: '320px' }}>Endereço</h1>
                        <div className="form__group">
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px', }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="cep"
                                            type="text"
                                            value={form.cep}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('cep')}
                                            onBlur={() => handleFieldBlur('cep')}
                                            style={{
                                                marginBottom: '10px',
                                                width: '150px', marginRight: '5px',
                                                border: fieldError &&
                                                           formSubmitted &&
                                                                   form.cep === '' ?
                                                                         '1px solid red' : '1px solid #ccc'
                                            }} />
                                        <label style={{ fontWeight: 'bold' }}>CEP</label>
                                    </span>
                                    {isErrorMessagesVisible &&
                                                     formSubmitted &&
                                                       form.cep === '' &&
                                                             !formFocused.cep && (
                                            <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                                {errorMessages.cep}
                                            </div>)}
                                </div>
                                <Button
                                    type="button"
                                    className="pi pi-search"
                                    onClick={handleSearch}
                                    style={{
                                        background: 'linear-gradient(45deg,#6610F2,#741FFF)',
                                        color: 'white',
                                        width: '50px',
                                        height: '30px',
                                        fontWeight: 'bold',
                                        marginRight: '30px',
                                        marginBottom: '15px'
                                    }} />
                                {showCEPError && (
                                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '5px' }}>
                                        {!isCEPValid ?
                                             'CEP inválido ou não foi encontrado!' :
                                                     'CEP Encontrado.'}
                                    </div>)}
                            </div>
                        </div>
                        <div className="form__group">
                            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '5px' }}>
                                <div style={{ marginRight: '5px' }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="street"
                                            type="text"
                                            value={form.street}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('street')}
                                            onBlur={() => handleFieldBlur('street')}
                                            style={{ width: '350px',
                                                marginRight: '5px',
                                                border: fieldError &&
                                                          formSubmitted &&
                                                             form.street === '' ?
                                                                 '1px solid red' : '1px solid #ccc'}}/>
                                        <label style={{ fontWeight: 'bold' }} >Rua</label>
                                    </span>
                                    {isErrorMessagesVisible &&
                                        formSubmitted &&
                                        form.street === '' &&
                                        !formFocused.street && (
                                            <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                                {errorMessages.street}
                                            </div>)}
                                </div>
                                <div style={{ marginRight: '5px' }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="number"
                                            type="text"
                                            placeholder="Número"
                                            value={form.number}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('number')}
                                            onBlur={() => handleFieldBlur('number')}
                                            style={{ width: '80px',
                                                marginRight: '5px',
                                                border: fieldError &&
                                                          formSubmitted &&
                                                             form.number === '' ?
                                                    '1px solid red' : '1px solid #ccc'}} />
                                        <label style={{ fontWeight: 'bold' }}>Número</label>
                                    </span>
                                    {isErrorMessagesVisible &&
                                                    formSubmitted &&
                                                      form.number === '' &&
                                                        !formFocused.number && (
                                            <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                                {errorMessages.number}
                                            </div>)}
                                </div>
                                <div>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="neighborhood"
                                            type="text"
                                            placeholder="Bairro"
                                            value={form.neighborhood}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('neighborhood')}
                                            onBlur={() => handleFieldBlur('neighborhood')}
                                            style={{
                                                width: '150px',
                                                marginRight: '5px',
                                                border: fieldError &&
                                                          formSubmitted &&
                                                             form.neighborhood === '' ?
                                                    '1px solid red' : '1px solid #ccc'}} />
                                        <label style={{ fontWeight: 'bold' }} >Bairro</label>
                                    </span>
                                    {isErrorMessagesVisible &&
                                                     formSubmitted &&
                                                form.neighborhood === '' &&
                                                    !formFocused.neighborhood && (
                                            <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                                {errorMessages.neighborhood}
                                            </div>)}
                                </div>
                            </div>
                        </div>
                        <div className="form__group">
                            <div style={{ display: 'flex' }}>
                                <div style={{ marginRight: '10px' }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="city"
                                            type="text"
                                            placeholder="Cidade"
                                            value={form.city}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('city')}
                                            onBlur={() => handleFieldBlur('city')}
                                            style={{ width: '150px', 
                                                border: fieldError &&
                                                         formSubmitted && 
                                                            form.city === '' ?
                                                             '1px solid red' : '1px solid #ccc',
                                            }}
                                        />
                                        <label style={{ fontWeight: 'bold' }}>Cidade</label>
                                    </span>
                                    {isErrorMessagesVisible && formSubmitted && form.city === '' && !formFocused.city && (
                                        <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                            {errorMessages.city}
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginRight: '10px' }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="state"
                                            type="text"
                                            placeholder="Estado"
                                            value={form.state}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('state')}
                                            onBlur={() => handleFieldBlur('state')}
                                            style={{
                                                width: '80px',
                                                border: fieldError &&
                                                          formSubmitted && 
                                                            form.state === '' ? '1px solid red' : '1px solid #ccc'}}/>
                                        <label style={{ fontWeight: 'bold' }}>Estado</label>
                                    </span>
                                    {isErrorMessagesVisible  && formSubmitted && form.state === '' && !formFocused.state && (
                                        <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                            {errorMessages.state}
                                        </div>)}
                                </div>
                                <div>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="complement"
                                            type="text"
                                            value={form.complement}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('complement')}
                                            onBlur={() => handleFieldBlur('complement')}
                                            style={{
                                                width: '350px',
                                                border:
                                                    fieldError && 
                                                        formSubmitted && 
                                                            form.complement === '' ? '1px solid red' : '1px solid #ccc'}}/>
                                        <label style={{ fontWeight: 'bold' }}>Complemento</label>
                                    </span>
                                    {isErrorMessagesVisible  && formSubmitted && form.complement === '' && !formFocused.complement && (
                                        <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                            {errorMessages.complement}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Button type="submit"
                    label="Enviar"
                    style={{
                        background: 'linear-gradient(45deg,#6610F2,#741FFF)',
                        color: 'white',
                        width: '80px',
                        height: '30px',
                        fontWeight: 'bold'}} />
            </form>
        </Dialog >
    )
}