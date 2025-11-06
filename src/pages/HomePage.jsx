import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from '../assets/logo.png'; // Logo importada
import photo from '../assets/foto-presente.jpg';

// ====================================================================
// COMPONENTE AUXILIAR: Galeria de Imagens/Imagem Única
// ====================================================================
const ProductImageGallery = ({ images, nameProduct, professorPicture }) => {
  // Prioriza o professorPicture se for fornecido (que é o base64)
  const imageSources = professorPicture ? [professorPicture] : (images || []);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (imageSources.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Sem Imagem</p>
      </div>
    );
  }

  const totalImages = imageSources.length;
  // Se for uma imagem base64 de professor, a URL é construída com o prefixo data:
  const currentImageSrc = imageSources[currentImageIndex].startsWith("data:")
    ? imageSources[currentImageIndex]
    : (professorPicture ? `data:image/jpeg;base64,${professorPicture}` : imageSources[currentImageIndex]);

  const goToNext = () =>
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  const goToPrev = () =>
    setCurrentImageIndex((prevIndex) => (prev - 1 + totalImages) % totalImages);

  return (
    // Alterado h-48 para h-60 para ter mais espaço vertical para a imagem
    <div className="relative h-60 overflow-hidden bg-gray-100">
      <img
        src={currentImageSrc}
        alt={`Imagem ${currentImageIndex + 1} de ${totalImages} do item ${nameProduct}`}
        // object-contain para garantir que a imagem inteira seja visível.
        className="w-full h-full object-contain transition duration-300"
      />
      {totalImages > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
          >
            &lt;
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
          >
            {/* CORREÇÃO DO ERRO DE SINTAXE: O { e } externos foram removidos */}
            &gt;
          </button>
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <span className="text-white text-xs bg-black bg-opacity-60 px-2 py-1 rounded">
              {currentImageIndex + 1} / {totalImages}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================
const HomePage = () => {
  // HOOK DO REACT ROUTER DOM ADICIONADO AQUI
  const navigate = useNavigate();

  // Estado para Produtos
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Estado para Professores
  const [professors, setProfessors] = useState([]);
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(false);
  
  // NOVO ESTADO para Pacotes
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  // ESTADOS DE MODAL
  const [showProfessorListModal, setShowProfessorListModal] = useState(false);
  const [showSpecialtyListModal, setShowSpecialtyListModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  // NOVO ESTADO DE MODAL para Pacotes
  const [showPackageModal, setShowPackageModal] = useState(false); 
  
  // NOVO ESTADO DE MODAL para seleção de pagamento
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false); 
  
  // NOVO ESTADO DE MODAL para exibir o QR Code PIX
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState({ encodedImage: '', payload: '', totalValue: 0, freteValue: 0 }); // Atualizado para incluir valores

  // NOVO ESTADO DE MODAL: Formulário de Cartão de Crédito
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);

  // NOVO: Estado para a barra de pesquisa do modal de especialidades
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState('');

  // Estado para Checkout (Geral)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // ====================================================================
  // NOVO ESTADO: Polling de Status de Pagamento
  // ====================================================================
  const [isPollingPaymentStatus, setIsPollingPaymentStatus] = useState(false);
  // NOVO ESTADO: Armazena o ID do registro de pagamento para Polling de Produto
  const [productPaymentId, setProductPaymentId] = useState(null);


  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  // NOVO: Estado para Pacote Selecionado
  const [selectedPackage, setSelectedPackage] = useState(null); 
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Dados básicos do comprador (mantidos apenas para o fluxo de Produtos/Pacotes)
  const clearBuyerData = () => ({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    address: "",
    // NOVO: Adicionado campo de CEP para frete de produto
    postalCode: "", 
  });
  const [buyerData, setBuyerData] = useState(clearBuyerData());

  // NOVO ESTADO: Dados do Formulário de Cartão de Crédito
  const clearCardData = () => ({
      // Dados do Cartão de Crédito
      creditCardNumber: "",
      creditCardBrand: "", // Em um projeto real, isso seria descoberto com base no número
      creditCardCcv: "",
      creditCardHolderName: "",
      creditCardExpiryMonth: "",
      creditCardExpiryYear: "",
      // Dados do Titular do Cartão (Antifraude)
      holderName: "",
      holderEmail: "",
      holderCpfCnpj: "",
      holderPostalCode: "",
      holderAddressNumber: "",
  });
  const [cardData, setCardData] = useState(clearCardData());

  // --- BUSCAR PROFESSORES ---
  const fetchProfessors = async () => {
    setIsLoadingProfessors(true);
    try {
      const response = await axios.get("https://backendagenda-paf6.onrender.com/getProfessor");
      setProfessors(response.data.professors || []);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
      alert("Não foi possível carregar a lista de professores.");
    } finally {
      setIsLoadingProfessors(false);
    }
  };
  
  // --- NOVO: BUSCAR PACOTES ---
  const fetchPackages = async () => {
    setIsLoadingPackages(true);
    try {
      // Ajustado o endpoint para /getPackages conforme solicitado
      const response = await axios.get("https://backendagenda-paf6.onrender.com/getPackages"); 
      setPackages(response.data || []); // Assumindo que a rota retorna o array de pacotes diretamente
    } catch (err) {
      console.error("Erro ao buscar pacotes:", err);
      alert("Não foi possível carregar a lista de pacotes.");
    } finally {
      setIsLoadingPackages(false);
    }
  };


  // Buscar produtos (Mantido)
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await axios.get("https://backendagenda-paf6.onrender.com/getProducts");
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      alert("Não foi possível carregar a lista de produtos.");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Efeito para carregar dados ao abrir o modal, se não estiverem carregados
  useEffect(() => {
    // Carrega professores/especialidades
    if (showProfessorListModal || showSpecialtyListModal) {
      if (professors.length === 0) fetchProfessors();
    }
    // Carrega produtos
    if (showProductModal) {
      if (products.length === 0) fetchProducts();
    }
    // Carrega pacotes APENAS quando o modal de pacotes está aberto
    if (showPackageModal) { 
        if (packages.length === 0) fetchPackages();
    }
  }, [showProfessorListModal, showSpecialtyListModal, showProductModal, showPackageModal, professors.length, products.length, packages.length]);


  // ====================================================================
  // NOVO: Efeito para Polling de Status de Pagamento PIX
  // ====================================================================
  useEffect(() => {
    let intervalId = null;

    if (isPollingPaymentStatus) {
      
      const isProfessorFlow = !!selectedProfessor;
      const pollingData = { name: buyerData.name }; // Padrão: usa o nome do comprador

      // Lógica de Polling para PIX de AULA
      if (isProfessorFlow) {
        if (!pollingData.name) {
            console.error("Polling de pagamento iniciado, mas o nome do comprador está vazio.");
            setIsPollingPaymentStatus(false);
            return;
        }

      // Lógica de Polling para PIX de PRODUTO
      } else if (productPaymentId) {
          // Para produto, usamos o ID do registro de pagamento criado no backend
          pollingData.paymentId = productPaymentId; 
      } else {
        console.error("Polling de pagamento iniciado sem nome de comprador ou ID de pagamento de produto.");
        setIsPollingPaymentStatus(false);
        return;
      }


      // Inicia o "martelo" (polling)
      intervalId = setInterval(async () => {
        try {
          const endpoint = isProfessorFlow 
            ? 'https://backendagenda-paf6.onrender.com/find-payment-class' // Aula: verifica pelo nome (Assumindo que o nome é único o suficiente para MOCK)
            : 'https://backendagenda-paf6.onrender.com/find-payment-product'; // Produto/Pacote: Rota de verificação real por ID do registro

          const response = await axios.post(endpoint, pollingData);
          
          const isPaid = response.data.isPaid; // Espera um boolean (true/false)

          if (isPaid === true) {
            clearInterval(intervalId); // Para o "martelo"
            setIsPollingPaymentStatus(false); // Para o estado de polling
            
            alert(`Pagamento PIX confirmado! ${isProfessorFlow ? 'Você será redirecionado para a agenda.' : 'Sua compra foi concluída com sucesso.'}`);
            
            // ==================================================
            // Ação de sucesso (Redirecionamento para Agenda ou Fechamento)
            // ==================================================
            if (isProfessorFlow) {
                const professorState = selectedProfessor;
                const specialtyState = selectedSpecialty;

                handleCloseCheckout(); 
                
                navigate('/agenda', { 
                    state: { 
                        professor: professorState, 
                        specialty: specialtyState 
                    } 
                });
            } else {
                // Ação de sucesso para produto/pacote (simplesmente fecha)
                 handleCloseCheckout(); 
            }
          }
          // Se for false, o intervalo continua...
        } catch (error) {
          console.error("Erro ao verificar status do pagamento PIX:", error);
          // Em um erro de rede, etc., é melhor deixar o polling continuar por um tempo
          // ou implementar um contador de tentativas/tempo limite.
        }
      }, 3000); // Bate a cada 3 segundos
    }

    // Função de limpeza do useEffect:
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // ATUALIZAÇÃO: Adiciona novas dependências para o polling de produto
  }, [isPollingPaymentStatus, buyerData.name, navigate, selectedProfessor, selectedSpecialty, productPaymentId]);


  // NOVO HANDLER: Abre Modal de Professores (Visão simples)
  const handleOpenProfessorList = async () => {
    handleCloseAllModals();
    setShowProfessorListModal(true);
    if (professors.length === 0) await fetchProfessors();
  };
  
  // NOVO HANDLER: Abre Modal de Especialidades (Visão de Especialidades/Filtro)
  const handleOpenSpecialtyList = async () => {
    handleCloseAllModals();
    setShowSpecialtyListModal(true);
    if (professors.length === 0) await fetchProfessors();
  };

  // NOVO HANDLER: Abre Modal de Produtos (Terceiro Botão)
  const handleOpenProductList = async () => {
    handleCloseAllModals();
    setShowProductModal(true);
    if (products.length === 0) await fetchProducts();
  };

  // NOVO HANDLER: Abre Modal de Pacotes (Implementação solicitada)
  const handleOpenPackageList = async () => {
    handleCloseAllModals();
    setShowPackageModal(true);
    if (packages.length === 0) await fetchPackages();
  };


  // HANDLER: Fecha Todos os Modais de Lista
  const handleCloseAllModals = () => {
    setShowProfessorListModal(false);
    setShowSpecialtyListModal(false);
    setShowProductModal(false);
    setShowPackageModal(false); // Fechar novo modal de pacotes
    // Limpa o termo de pesquisa ao fechar, para a próxima abertura
    setSpecialtySearchTerm(''); 
  };

  // HANDLER: Agendamento de Aula
  const handleScheduleClass = (professor, specialty) => {
    handleCloseAllModals(); 
    setSelectedProfessor(professor);
    setSelectedSpecialty(specialty);
    setSelectedProduct(null);
    setSelectedPackage(null); // Limpar pacote
    // Dados MOCK para agendamento de aula (PIX precisa de dados do aluno)
    setBuyerData({
        name: "Comprador de Teste", // Mudar para um campo de input real se necessário
        email: "teste@email.com",   // Mudar para um campo de input real se necessário
        cpf: "999.999.999-99",     // Mudar para um campo de input real se necessário
        phone: "",
        address: "",
        postalCode: "",
    });
    // Limpar dados do cartão
    setCardData(clearCardData());
    setShowCheckoutModal(true);
  };

  // HANDLER: Compra de Produto ou Pacote (ajustado)
  const handleBuyItem = (item) => {
    handleCloseAllModals();
    // Verifica se é um pacote (pacotes têm 'packageName', produtos têm 'name')
    if (item.packageName) { 
        setSelectedPackage(item);
        setSelectedProduct(null);
    } else {
        setSelectedProduct(item);
        setSelectedPackage(null);
    }
    setSelectedProfessor(null);
    setSelectedSpecialty(null);
    setBuyerData(clearBuyerData()); // Garante que os campos de dados do comprador estejam limpos
    // Limpar dados do cartão
    setCardData(clearCardData());
    setShowCheckoutModal(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutModal(false);
    setShowPaymentMethodModal(false); // Fechar novo modal de pagamento
    setShowPixModal(false); // Fechar modal de PIX
    setShowCreditCardModal(false); // Fechar modal de Cartão
    setPixData({ encodedImage: '', payload: '', totalValue: 0, freteValue: 0 }); // Limpar dados PIX e valores
    setCardData(clearCardData()); // Limpar dados do cartão
    setSelectedProduct(null);
    setSelectedProfessor(null);
    setSelectedSpecialty(null);
    setSelectedPackage(null); // Limpar pacote
    setIsProcessingPayment(false);
    setBuyerData(clearBuyerData());
    setProductPaymentId(null); // Limpar ID do pagamento de produto

    // ====================================================================
    // ADICIONADO: Garante que o polling pare ao fechar o checkout
    // ====================================================================
    setIsPollingPaymentStatus(false);
  };

  const handleInputChange = (e) => {
    setBuyerData({ ...buyerData, [e.target.name]: e.target.value });
  };
  
  const handleCardInputChange = (e) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  // --- Função de Pagamento SIMULADA: Abre o Modal de Seleção (Pix/Cartão) ---
  const handleConfirmPayment = async () => {
    if (isProcessingPayment) return;
    
    const isProfessorPurchase = !!selectedProfessor && !!selectedSpecialty;
    // O pacote e produto seguem a mesma lógica de validação de dados completos
    const isProductOrPackagePurchase = !!selectedProduct || !!selectedPackage; 
    
    if (!selectedProfessor && !selectedProduct && !selectedPackage) {
        alert("❌ ERRO: Nenhum item selecionado para compra.");
        return;
    }
    
    // --- Lógica para Checkout de Produto/Pacote (Validação REAL) ---
    if (isProductOrPackagePurchase) { 
        // Verifica se é produto/pacote (exige todos os campos)
        if (!buyerData.name || !buyerData.email || !buyerData.cpf || !buyerData.address || !buyerData.postalCode) {
            alert("❌ ERRO: Por favor, preencha todos os campos obrigatórios (Nome, Email, CPF, Endereço, CEP).");
            return;
        }
    } else {
        // Para agendamento de aula, valida os dados mockados no buyerData
        if (!buyerData.name || !buyerData.email || !buyerData.cpf) {
             alert("❌ ERRO: Por favor, preencha os dados de nome, email e CPF para o PIX/Cartão.");
            return;
        }
    }
    
    // Simplesmente abre o modal de seleção de método de pagamento
    setShowCheckoutModal(false); // Fecha o checkout
    setShowPaymentMethodModal(true); // Abre a seleção
  };
  
  // --- FUNÇÃO INTEGRADA: Processa o Pagamento (MOCK e PIX/Cartão real) ---
  const handleProcessPayment = async (method) => {
    
    const isProfessorPurchase = !!selectedProfessor && !!selectedSpecialty;
    const value = parseFloat(selectedSpecialty?.pricePerClass || selectedPackage?.price || selectedProduct?.price || 0);
    const item = selectedProfessor ? 'Agendamento de Aula' : (selectedPackage ? 'Pacote' : 'Produto');

    if (method === "Cartão") {
        // Ação para Cartão de Crédito
        if (isProfessorPurchase) {
            // Abre o formulário de Cartão de Crédito APENAS para Agendamento de Aula
            setShowPaymentMethodModal(false);
            setShowCreditCardModal(true);
        } else {
             // PIX para Produto/Pacote: USARIA OUTRA ROTA. Por simplicidade, MANTEM O MOCK
            setIsProcessingPayment(true);
            setTimeout(() => {
                setIsProcessingPayment(false);
                alert(`✅ Sucesso! Processando pagamento de ${item} via Cartão (MOCK).`);
                handleCloseCheckout();
            }, 1500);
        }
        return;
    }

    if (method === "Pix") {
        setIsProcessingPayment(true);
        
        // --- INTEGRAÇÃO PIX REAL PARA PRODUTO/PACOTE ---
        if (!isProfessorPurchase) {
            
            // Note: Pacote é tratado como Produto MOCK, mas a rota real é para produto.
            const productData = selectedProduct || selectedPackage; // Usa o pacote como produto mockado
            
            if (!productData) {
                alert("Erro interno: Produto/Pacote não selecionado.");
                setIsProcessingPayment(false);
                return;
            }
            
            // Monta o objeto que o backend espera: { product, buyerData }
            const pixRequestData = {
                // Para Produto real (usamos o estado completo do produto)
                product: {
                    name: productData.name || productData.packageName, // Nome do item
                    value: productData.price, // Preço base
                    CEP: productData.CEP || "95010010", // Mock CEP de Origem se não existir
                    weight: productData.weight || 1.0, // Mock peso
                    height: productData.height || 10, // Mock altura
                    width: productData.width || 10, // Mock largura
                    frete: productData.frete || false, // Mock frete
                }, 
                buyerData: {
                    name: buyerData.name,
                    email: buyerData.email,
                    cpfCnpj: buyerData.cpf, // O backend espera cpfCnpj
                    mobilePhone: buyerData.phone,
                    address: buyerData.address,
                    cepDestino: buyerData.postalCode, // O backend espera cepDestino
                }
            };
            
            try {
                // ATUALIZADO: Rota de PIX Transparente para Produto/Pacote
                const response = await axios.post(
                    'https://backendagenda-paf6.onrender.com/buyProductWithPix', 
                    pixRequestData
                );
                
                if (response.data.success) {
                    setPixData({
                        encodedImage: response.data.encodedImage,
                        payload: response.data.payload,
                        totalValue: response.data.totalValue, // Recebe o total com frete
                        freteValue: response.data.valueFrete, // Recebe o valor do frete
                    });
                    setProductPaymentId(response.data.paymentId); // Armazena o ID para o Polling
                    
                    setShowPaymentMethodModal(false); // Fecha seleção de método
                    setShowPixModal(true); // Abre modal do PIX

                    // ADICIONADO: Inicia o "martelo" (polling) de produto
                    setIsPollingPaymentStatus(true); 

                } else {
                    throw new Error("Resposta de sucesso, mas sem dados PIX.");
                }

            } catch (error) {
                console.error("Erro ao processar PIX de Produto/Pacote:", error.response?.data || error.message);
                const errorMessage = error.response?.data?.message || error.message;
                alert(`❌ Erro ao processar PIX para ${item}. Erro: ${errorMessage}`);
                setShowPaymentMethodModal(true); // Volta para seleção de método
            } finally {
                setIsProcessingPayment(false);
            }
            
            return; // Sai da função
        }
        
        // --- INTEGRAÇÃO PIX REAL PARA AGENDAMENTO DE AULA (Mantido) ---
        try {
            const pixRequestData = {
                name: buyerData.name,
                email: buyerData.email,
                cpfCnpj: buyerData.cpf,
                value: value, 
            };
            
            const response = await axios.post(
                'https://backendagenda-paf6.onrender.com/payperclass-pix', 
                pixRequestData
            );
            
            if (response.data.success) {
                setPixData({
                    encodedImage: response.data.encodedImage,
                    payload: response.data.payload,
                    totalValue: value, // Aula: o valor é o preço da aula
                    freteValue: 0,
                });
                setShowPaymentMethodModal(false); // Fecha seleção de método
                setShowPixModal(true); // Abre modal do PIX

                // ADICIONADO: Inicia o "martelo" (polling) de aula
                setIsPollingPaymentStatus(true);

            } else {
                throw new Error("Resposta de sucesso, mas sem dados PIX.");
            }

        } catch (error) {
            console.error("Erro ao processar PIX de Aula:", error.response?.data || error.message);
            alert(`❌ Erro ao processar PIX para ${item}. Tente outro método ou verifique os dados.`);
            setShowPaymentMethodModal(true); // Volta para seleção de método
        } finally {
            setIsProcessingPayment(false);
        }
    }
  };
  
  // --- FUNÇÃO PARA ENVIAR PAGAMENTO COM CARTÃO DE CRÉDITO ---
  const handleCardPaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    const isProfessorPurchase = !!selectedProfessor && !!selectedSpecialty;
    const value = parseFloat(selectedSpecialty?.pricePerClass || 0);

    if (!isProfessorPurchase) {
        alert("Erro interno: Pagamento com Cartão de Crédito só é permitido para Agendamento de Aula neste fluxo.");
        setIsProcessingPayment(false);
        return;
    }

    // Validação mínima dos campos do cartão e do titular (ajuste conforme necessário)
    if (!cardData.creditCardNumber || !cardData.creditCardCcv || !cardData.creditCardHolderName || !cardData.creditCardExpiryMonth || !cardData.creditCardExpiryYear || !cardData.holderPostalCode || !cardData.holderAddressNumber) {
        alert("❌ ERRO: Por favor, preencha todos os dados do Cartão e do Titular (Antifraude).");
        setIsProcessingPayment(false);
        return;
    }
    
    // Dados obrigatórios para a rota de backend
    const cardRequestData = {
        name: buyerData.name,
        email: buyerData.email,
        cpfCnpj: buyerData.cpf,
        mobilePhone: buyerData.phone, // Opcional, mas útil
        value: value, 
        
        // Dados do Cartão
        creditCardNumber: cardData.creditCardNumber.replace(/\s/g, ''), // Remove espaços
        creditCardBrand: "VISA", // MOCK/ASSUMIDO - idealmente viria de uma lib ou input
        creditCardCcv: cardData.creditCardCcv,
        creditCardHolderName: cardData.creditCardHolderName,
        creditCardExpiryMonth: cardData.creditCardExpiryMonth,
        creditCardExpiryYear: cardData.creditCardExpiryYear,

        // Dados do Titular (Antifraude)
        holderName: cardData.holderName || buyerData.name,
        holderEmail: cardData.holderEmail || buyerData.email,
        holderCpfCnpj: cardData.holderCpfCnpj || buyerData.cpf,
        holderPostalCode: cardData.holderPostalCode,
        holderAddressNumber: cardData.holderAddressNumber
    };
    
    try {
        const response = await axios.post(
            'https://backendagenda-paf6.onrender.com/payperclass-creditcard', 
            cardRequestData
        );

        if (response.data.success) {
            // ATUALIZAÇÃO: Redireciona direto para /agenda COM DADOS
            alert(`✅ Sucesso! Pagamento via Cartão concluído. Status: ${response.data.status}. Redirecionando para a agenda.`);
            
            const professorState = selectedProfessor;
            const specialtyState = selectedSpecialty;

            handleCloseCheckout(); // Limpa tudo e fecha modais
            
            // Redireciona COM OS DADOS CAPTURADOS
            navigate('/agenda', { 
                state: { 
                    professor: professorState, 
                    specialty: specialtyState 
                } 
            }); 
            
        } else {
            throw new Error(response.data.errorDetail || "Pagamento recusado ou erro desconhecido.");
        }
    } catch (error) {
        console.error("Erro ao processar Cartão de Crédito:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.errorDetail || "Erro ao processar pagamento. Verifique os dados do cartão e do titular.";
        alert(`❌ Erro no Pagamento com Cartão: ${errorMessage}`);
    } finally {
        setIsProcessingPayment(false);
    }
  };


  const handleProfessorLogin = () => {
    navigate('/professorPainel'); 
  };
  
  // Função auxiliar para evitar a duplicação do prefixo base64 na URL da imagem
  const getProfessorImageSrc = (base64) => {
    if (!base64) return null;
    return base64.startsWith("data:") ? base64 : `data:image/jpeg;base64,${base64}`;
  };

  // --- Componente Card de Pacote (Auxiliar com correção de estilo) ---
  const renderPackageCard = (pkg, i) => (
    <div key={pkg._id || i} className="border rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow bg-white flex flex-col" style={{ borderColor: "#D8F3DC" }}>
        {/* Card de Pacotes tem um fundo diferente para distinção */}
        <div className="p-6 space-y-3 flex-grow"> 
            <h3 className="text-2xl font-bold text-[#201E1E]">{pkg.packageName}</h3>
            <p className="text-gray-600">{pkg.description}</p>
            {/* CORREÇÃO DE COR: Alterado de text-green-600 para text-blue-500 */}
            <p className="text-xl font-extrabold pt-2 text-blue-500"> R$ {parseFloat(pkg.price || 0).toFixed(2)} </p>
            
            {/* Professores Parceiros */}
            {pkg.professors && pkg.professors.length > 0 && (
                <div className="mt-4">
                    <p className="text-md font-semibold mb-2">Aulas com:</p>
                    <div className="flex flex-wrap gap-3">
                        {pkg.professors.map((p, idx) => {
                            const professorImageSrc = getProfessorImageSrc(p.image);
                            return (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="h-10 w-10 rounded-full overflow-hidden mb-1 bg-gray-300">
                                        {professorImageSrc && (
                                            <img 
                                                src={professorImageSrc} 
                                                alt={`Foto de ${p.name}`}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-700 font-medium">{p.name} ({p.quantityClassess}x)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
        <div className="p-6 pt-0">
            <button 
                className="w-full font-bold py-3 rounded-lg shadow-md hover:scale-105 transition text-white" 
                // CORREÇÃO DE COR: Alterado de #D8F3DC para o azul principal #9AC3CD
                style={{ backgroundColor: "#9AC3CD" }} 
                onClick={() => handleBuyItem(pkg)} 
            > 
                Adquirir Pacote
            </button>
        </div>
    </div>
  );


  // --- Renderização do Conteúdo da Seção de Pacotes (Novo Conteúdo para o Modal) ---
  const renderPackagesContent = () => (
    <div className="max-w-7xl mx-auto pt-4 pb-8">
        <h2 className="text-3xl font-bold mb-8 text-[#201E1E]">Nossos Pacotes de Aulas</h2>
        {isLoadingPackages && <p className="text-center py-10 text-xl">Carregando Pacotes...</p>}
        {!isLoadingPackages && packages.length === 0 ? (
            <p className="text-center py-10 text-xl">Nenhum pacote de aula disponível.</p>
        ) : (
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
                {packages.map(renderPackageCard)}
            </div>
        )}
        
        {/* Adicionando botões de navegação para alternar entre modais */}
        <div className="mt-8 text-center flex justify-center gap-4">
            <button 
                onClick={handleOpenProfessorList} 
                className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
                style={{ backgroundColor: "#A9CBD2" }} 
            > 
                Buscar Professores → 
            </button>
            <button 
                onClick={handleOpenSpecialtyList} 
                className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
                style={{ backgroundColor: "#A9CBD2" }} 
            > 
                Buscar por Especialidade → 
            </button>
            <button 
                onClick={handleOpenProductList} 
                className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
                style={{ backgroundColor: "#9AC3CD" }} 
            > 
                Veja Nossos Produtos → 
            </button>
        </div>
    </div>
  );


  // --- Renderização da Lista de Professores (Visão Geral) ---
  const renderProfessorListContent = () => (
    <div className="max-w-7xl mx-auto pt-4 pb-8">
      <h2 className="text-3xl font-bold mb-8">Nossos Professores Disponíveis</h2>
      {isLoadingProfessors && <p className="text-center py-10 text-xl">Carregando Professores...</p>}
      {!isLoadingProfessors && professors.length === 0 ? (
        <p className="text-center py-10 text-xl">Nenhum professor disponível.</p>
      ) : (
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
          {professors.map((professor, i) => (
            <div key={professor._id || i} className="border rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow bg-white" style={{ borderColor: "#A9CBD2" }} >
              <ProductImageGallery professorPicture={professor.picture} nameProduct={professor.name} />
              <div className="p-6 space-y-3">
                <h3 className="text-2xl font-bold">{professor.name}</h3>

                {/* Exibir Especialidades em forma de lista */}
                <div className="mt-4">
                  <p className="text-lg font-semibold mb-2">Especialidades:</p>
                  {professor.specialties && professor.specialties.length > 0 ? (
                    <ul className="list-disc ml-5 space-y-1">
                      {professor.specialties.map((specialty, idx) => (
                        <li key={idx} className="text-gray-700">
                          {specialty.typeDance} - R$ {parseFloat(specialty.pricePerClass || 0).toFixed(2)}
                          {/* Botão de agendamento por especialidade */}
                          <button
                            className="text-sm font-semibold ml-3 px-2 py-1 rounded-lg hover:bg-opacity-90 transition"
                            style={{ backgroundColor: "#D8F3DC", color: "#201E1E" }}
                            onClick={() => handleScheduleClass(professor, specialty)}
                          >
                            Agendar
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma especialidade listada.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* BOTÕES DE NAVEGAÇÃO ENTRE MODAIS */}
      <div className="mt-8 text-center flex justify-center gap-4">
        <button 
          onClick={handleOpenSpecialtyList} 
          className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
          style={{ backgroundColor: "#A9CBD2" }} 
        > 
          Voltar para Especialidades → 
        </button>
        <button 
          onClick={handleOpenProductList} 
          className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
          style={{ backgroundColor: "#9AC3CD" }} 
        > 
          Veja Nossos Produtos → 
        </button>
        <button 
            onClick={handleOpenPackageList} 
            className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
            style={{ backgroundColor: "#9AC3CD" }} 
        > 
            Nossos Pacotes → 
        </button>
      </div>
    </div>
  );

  // --- Renderização da Lista de Especialidades (Com barra de pesquisa e correção da imagem) ---
  const renderSpecialtyListContent = () => {
    const lowerCaseSearchTerm = specialtySearchTerm.toLowerCase();

    // 1. Filtrar professores por nome ou especialidade
    const filteredProfessors = professors.filter(prof => {
        const nameMatch = prof.name.toLowerCase().includes(lowerCaseSearchTerm);
        const specialtyMatch = prof.specialties && prof.specialties.some(spec => 
            spec.typeDance.toLowerCase().includes(lowerCaseSearchTerm)
        );
        return nameMatch || specialtyMatch;
    });
    
    // 2. Agrupar as especialidades dos professores filtrados
    const specialtyMap = {};
    filteredProfessors.forEach(prof => {
        prof.specialties && prof.specialties.forEach(spec => {
            const key = spec.typeDance;
            if (!specialtyMap[key]) {
                specialtyMap[key] = {
                    typeDance: spec.typeDance,
                    professors: [],
                };
            }
            // Adiciona o professor à especialidade, incluindo o preço específico
            specialtyMap[key].professors.push({
                ...prof, 
                pricePerClass: spec.pricePerClass 
            });
        });
    });
    
    const specialtyList = Object.values(specialtyMap).sort((a, b) => a.typeDance.localeCompare(b.typeDance));

    return (
        <div className="max-w-7xl mx-auto pt-4 pb-8">
            <h2 className="text-3xl font-bold mb-8">Buscar por Especialidade</h2>
            
            {/* NOVO: Barra de Pesquisa */}
            <input
                type="text"
                placeholder="Buscar por nome do professor ou especialidade..."
                value={specialtySearchTerm}
                onChange={(e) => setSpecialtySearchTerm(e.target.value)}
                className="w-full p-3 mb-8 border-2 rounded-lg text-lg focus:ring-2 focus:ring-[#A9CBD2]"
            />

            {isLoadingProfessors && <p className="text-center py-10 text-xl">Carregando Especialidades...</p>}
            {!isLoadingProfessors && specialtyList.length === 0 ? (
                <p className="text-center py-10 text-xl">
                    {specialtySearchTerm 
                        ? `Nenhum professor ou especialidade encontrado para "${specialtySearchTerm}".`
                        : "Nenhuma especialidade disponível."
                    }
                </p>
            ) : (
                <div className="space-y-8">
                    {specialtyList.map((specialty, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-lg border" style={{ borderColor: "#A9CBD2" }}>
                            <h3 className="text-2xl font-bold text-[#201E1E] mb-4 border-b pb-2">{specialty.typeDance}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {specialty.professors.map((professor, j) => {
                                    const professorImageSrc = getProfessorImageSrc(professor.picture); // Usando a função de correção
                                    return (
                                        <div key={j} className="flex flex-col items-center p-4 border rounded-lg bg-[#EAF5F7] shadow-sm">
                                            <div className="h-20 w-20 rounded-full overflow-hidden mb-3 bg-gray-300">
                                                {/* Imagem do Professor (Corrigida) */}
                                                {professorImageSrc && (
                                                    <img 
                                                        src={professorImageSrc} 
                                                        alt={`Foto de ${professor.name}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <p className="font-semibold text-lg text-[#201E1E]">{professor.name}</p>
                                            <p className="text-xl font-extrabold pt-1 text-blue-500"> 
                                                R$ {parseFloat(professor.pricePerClass || 0).toFixed(2)} / Aula
                                            </p>
                                            <button
                                                className="mt-3 w-full font-bold py-2 rounded-lg shadow-md hover:scale-105 transition text-white"
                                                style={{ backgroundColor: "#9AC3CD" }}
                                                onClick={() => handleScheduleClass(professor, { typeDance: specialty.typeDance, pricePerClass: professor.pricePerClass })}
                                            >
                                                Agendar {specialty.typeDance}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* BOTÕES DE NAVEGAÇÃO ENTRE MODAIS */}
            <div className="mt-8 text-center flex justify-center gap-4">
                <button 
                  onClick={handleOpenProfessorList} 
                  className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
                  style={{ backgroundColor: "#A9CBD2" }} 
                > 
                  Ver Professores (Geral) → 
                </button>
                <button 
                  onClick={handleOpenProductList} 
                  className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
                  style={{ backgroundColor: "#9AC3CD" }} 
                > 
                  Veja Nossos Produtos → 
                </button>
                <button 
                    onClick={handleOpenPackageList} 
                    className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
                    style={{ backgroundColor: "#9AC3CD" }} 
                > 
                    Nossos Pacotes → 
                </button>
            </div>
        </div>
    );
  };
  
  // Renderiza lista de produtos (Modal Separado)
  const renderProductListContent = () => (
    <div className="max-w-7xl mx-auto pt-4 pb-8">
       <h2 className="text-3xl font-bold mb-8">Nossos Produtos Disponíveis</h2> 
      {isLoadingProducts && <p className="text-center py-10 text-xl">Carregando Produtos...</p>}
      
      <div className="flex justify-between items-center pt-4 pb-8 gap-4">
        <button onClick={handleOpenProfessorList} className="flex-1 font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" style={{ backgroundColor: "#A9CBD2" }} >
          Buscar Professores →
        </button>
        <button onClick={handleOpenSpecialtyList} className="flex-1 font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" style={{ backgroundColor: "#A9CBD2" }} >
          Buscar por Especialidade →
        </button>
        <button 
            onClick={handleOpenPackageList} 
            className="flex-1 font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base text-white" 
            style={{ backgroundColor: "#9AC3CD" }} 
        > 
            Nossos Pacotes → 
        </button>
      </div>
      
      {!isLoadingProducts && products.length === 0 ? (
        <p className="text-center py-10 text-xl">Nenhum produto disponível para compra.</p>
      ) : (
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl">
          {products.map((product, i) => (
            <div key={product._id || i} className="border rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow bg-white" style={{ borderColor: "#A9CBD2" }} >
              <ProductImageGallery images={product.images} nameProduct={product.name} />
              <div className="p-6 space-y-3">
                <h3 className="text-2xl font-bold">{product.name}</h3>
                <p className="text-gray-600 line-clamp-2">{product.description}</p>
                <p className="text-xl font-extrabold pt-2 text-blue-500"> R$ {parseFloat(product.price || 0).toFixed(2)} </p>
                <button 
                  className="w-full font-bold py-3 rounded-lg shadow-md hover:scale-105 transition text-white" 
                  style={{ backgroundColor: "#9AC3CD" }} 
                  onClick={() => handleBuyItem(product)} 
                > 
                  Comprar Agora 
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
  
  // ====================================================================
  // COMPONENTE AUXILIAR: Modal de Lista (Professores ou Produtos)
  // ====================================================================
  const ListModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      // Fundo do overlay semi-transparente claro, para manter a visibilidade do fundo da página
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4 z-40">
        {/* Container do modal com fundo sólido (Fundo original da página) */}
        {/* ALTERADO: p-6 para p-4 sm:p-6 para melhor responsividade em mobile */}
        <div className="bg-[#F9FBEE] p-4 sm:p-6 rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] overflow-y-auto relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-3xl font-bold text-gray-700 hover:text-gray-900 transition"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    );
  };
  
  // ====================================================================
  // NOVO COMPONENTE AUXILIAR: Modal de Seleção de Método de Pagamento
  // ====================================================================
  const PaymentMethodModal = ({ isOpen, onClose, onSelectMethod, isProcessing }) => {
    if (!isOpen) return null;

    const isProfessorFlow = !!selectedProfessor;
    
    const itemDescription = selectedProfessor 
        ? `${selectedProfessor.name} (${selectedSpecialty.typeDance})`
        : selectedPackage
            ? selectedPackage.packageName
            : selectedProduct?.name;
            
    const itemPrice = parseFloat(selectedSpecialty?.pricePerClass || selectedPackage?.price || selectedProduct?.price || 0).toFixed(2);

    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2 text-3xl">💳</span> Selecione o Pagamento
          </h3>
          
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <p className="mb-2">
                Item: <span className="font-semibold">{itemDescription}</span>
            </p>
            <p className="text-xl font-extrabold text-blue-500">
                Valor Base: R$ {itemPrice}
            </p>
             {/* Aviso de frete (apenas para produto/pacote) */}
            {!isProfessorFlow && (
                 <p className="text-sm text-gray-500 mt-1">O valor final com frete será calculado ao gerar o PIX/Cartão.</p>
            )}
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => onSelectMethod("Pix")}
              className="w-full py-3 rounded-lg font-bold bg-green-500 hover:bg-green-600 transition disabled:opacity-50 text-white flex items-center justify-center"
              disabled={isProcessing}
            >
              <span className="mr-2 text-xl">🚀</span> 
              {isProcessing ? "Gerando PIX..." : "Pagar com Pix"}
            </button>
            
            <button
              onClick={() => onSelectMethod("Cartão")}
              className="w-full py-3 rounded-lg font-bold bg-purple-500 hover:bg-purple-600 transition disabled:opacity-50 text-white flex items-center justify-center"
              disabled={isProcessing}
            >
              <span className="mr-2 text-xl">💳</span>
              {isProcessing ? "Aguarde..." : "Pagar com Cartão"}
            </button>
            
            <button
              onClick={handleCloseCheckout} // Fecha todo o fluxo
              className="w-full py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
              disabled={isProcessing}
            >
              Cancelar Compra
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // ====================================================================
  // NOVO COMPONENTE AUXILIAR: Modal de Exibição do PIX
  // ====================================================================
  const PixModal = ({ isOpen, onClose, encodedImage, payload, isPolling, totalValue, freteValue }) => {
    if (!isOpen) return null;
    
    // Função para copiar o payload
    const handleCopy = () => {
        navigator.clipboard.writeText(payload);
        alert("Código PIX Copiado!");
    };
    
    // Verifica se a compra é de produto/pacote (frete > 0)
    const isProductFlow = freteValue > 0 || !!selectedProduct || !!selectedPackage;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full text-center">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center text-green-600">
                <span className="mr-2 text-3xl">✅</span> Pagamento PIX
            </h3>
            
            {/* NOVO: Aviso de Polling */}
            {isPolling ? (
                <p className="mb-4 text-gray-700 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    Estamos aguardando a confirmação do seu pagamento. 
                    Você será redirecionado automaticamente.
                </p>
            ) : (
                <p className="mb-4 text-gray-700">Escaneie o QR Code ou use o código Copia e Cola:</p>
            )}
            
            {/* Detalhes do Valor (Com ou sem frete) */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50 text-left">
                {isProductFlow && freteValue > 0 && (
                    <p className="text-sm text-gray-700">Frete: R$ {parseFloat(freteValue).toFixed(2)}</p>
                )}
                 <p className="text-xl font-extrabold text-blue-500">
                    Valor Total: R$ {parseFloat(totalValue).toFixed(2)}
                </p>
            </div>
            
            {/* QR Code (Imagem Base64) */}
            <div className="flex justify-center mb-6 border p-2 rounded-lg">
                {encodedImage ? (
                    <img 
                        // O prefixo data:image/png;base64, já é esperado que venha do backend
                        src={`data:image/png;base64,${encodedImage}`} 
                        alt="QR Code PIX" 
                        className="w-64 h-64 object-contain"
                    />
                ) : (
                    <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                        <p>Gerando QR Code...</p>
                    </div>
                )}
            </div>
            
            {/* Payload Copia e Cola */}
            <div className="mb-6">
                <textarea 
                    value={payload} 
                    readOnly 
                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 resize-none h-20"
                    placeholder="Código PIX Copia e Cola"
                />
                <button
                    onClick={handleCopy}
                    className="mt-2 w-full py-2 rounded-lg font-bold bg-blue-500 hover:bg-blue-600 transition text-white flex items-center justify-center"
                    disabled={!payload}
                >
                    <span className="mr-2 text-xl">📋</span> Copiar Código PIX
                </button>
            </div>
            
            <button
                onClick={handleCloseCheckout} // Fecha todo o fluxo
                className="w-full py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 transition"
            >
              Fechar
            </button>
          </div>
        </div>
    );
  };
  
  // ====================================================================
  // NOVO COMPONENTE AUXILIAR: Modal de Formulário do Cartão de Crédito
  // (Apenas para Agendamento de Aula)
  // ====================================================================
  const CreditCardModal = ({ isOpen, onClose, cardData, onInputChange, onSubmit, isProcessing }) => {
    if (!isOpen) return null;

    const itemDescription = `${selectedProfessor?.name} (${selectedSpecialty?.typeDance})`;
    const itemPrice = parseFloat(selectedSpecialty?.pricePerClass || 0).toFixed(2);
    
    // Funções auxiliares para formatação de campos (Exemplo)
    const formatCardNumber = (value) => {
        // Remove tudo que não for dígito e insere espaço a cada 4 dígitos
        return value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
    };
    
    // Função para tratar o mês/ano de expiração (Exemplo)
    const handleMonthYearChange = (e) => {
        let { name, value } = e.target;
        value = value.replace(/\D/g, ''); // Apenas dígitos
        
        // Simplesmente garante 2 dígitos. O Asaas espera strings.
        if (name === "creditCardExpiryMonth" && value.length > 2) value = value.substring(0, 2);
        if (name === "creditCardExpiryYear" && value.length > 4) value = value.substring(0, 4); 

        onInputChange({ target: { name, value } });
    };

    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto relative">
          <h3 className="text-2xl font-bold mb-4 flex items-center justify-center text-purple-600">
            <span className="mr-2 text-3xl">💳</span> Pagamento com Cartão
          </h3>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-3xl font-bold text-gray-700 hover:text-gray-900 transition"
            disabled={isProcessing}
          >
            &times;
          </button>
          
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <p className="mb-2">
                Item: <span className="font-semibold">{itemDescription}</span>
            </p>
            <p className="text-xl font-extrabold text-blue-500">
                Valor Total: R$ {itemPrice}
            </p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <h4 className="text-lg font-bold border-b pb-2 text-[#201E1E]">Dados do Cartão</h4>
            <div className="space-y-4">
                <input
                    type="text"
                    name="creditCardHolderName"
                    placeholder="Nome Impresso no Cartão*"
                    required
                    value={cardData.creditCardHolderName}
                    onChange={onInputChange}
                    className="border rounded-lg p-3 w-full"
                    disabled={isProcessing}
                />
                <input
                    type="text"
                    name="creditCardNumber"
                    placeholder="Número do Cartão*"
                    required
                    maxLength="19" // 16 dígitos + 3 espaços
                    value={formatCardNumber(cardData.creditCardNumber)}
                    onChange={(e) => onInputChange({ target: { name: e.target.name, value: e.target.value.replace(/\D/g, '') } })} // Deixa o valor bruto no estado
                    className="border rounded-lg p-3 w-full"
                    disabled={isProcessing}
                />
                <div className="flex gap-4">
                    <input
                        type="text"
                        name="creditCardExpiryMonth"
                        placeholder="Mês Exp. (MM)*"
                        required
                        maxLength="2"
                        value={cardData.creditCardExpiryMonth}
                        onChange={handleMonthYearChange}
                        className="border rounded-lg p-3 w-1/4"
                        disabled={isProcessing}
                    />
                    <input
                        type="text"
                        name="creditCardExpiryYear"
                        placeholder="Ano Exp. (AAAA)*"
                        required
                        maxLength="4"
                        value={cardData.creditCardExpiryYear}
                        onChange={handleMonthYearChange}
                        className="border rounded-lg p-3 w-1/4"
                        disabled={isProcessing}
                    />
                    <input
                        type="text"
                        name="creditCardCcv"
                        placeholder="CVV*"
                        required
                        maxLength="4"
                        value={cardData.creditCardCcv.replace(/\D/g, '')}
                        onChange={(e) => onInputChange({ target: { name: e.target.name, value: e.target.value.replace(/\D/g, '') } })}
                        className="border rounded-lg p-3 w-1/4"
                        disabled={isProcessing}
                    />
                    <select
                        name="creditCardBrand"
                        value={cardData.creditCardBrand}
                        onChange={onInputChange}
                        className="border rounded-lg p-3 w-1/4 bg-white"
                        disabled={isProcessing}
                    >
                        <option value="">Bandeira*</option>
                        {/* Em um projeto real, isso seria populado automaticamente */}
                        <option value="VISA">Visa</option>
                        <option value="MASTERCARD">Mastercard</option>
                        <option value="AMEX">Amex</option>
                        <option value="ELO">Elo</option>
                    </select>
                </div>
            </div>
            
            <h4 className="text-lg font-bold border-b pb-2 pt-4 text-[#201E1E]">Dados do Titular (Antifraude)</h4>
            <p className="text-sm text-gray-500">Se diferente do comprador, preencha abaixo.</p>
            <div className="space-y-4">
                <input
                    type="text"
                    name="holderName"
                    placeholder={`Nome Completo do Titular (Padrão: ${buyerData.name})`}
                    value={cardData.holderName}
                    onChange={onInputChange}
                    className="border rounded-lg p-3 w-full"
                    disabled={isProcessing}
                />
                 <input
                    type="text"
                    name="holderCpfCnpj"
                    placeholder={`CPF/CNPJ do Titular (Padrão: ${buyerData.cpf})`}
                    value={cardData.holderCpfCnpj}
                    onChange={onInputChange}
                    className="border rounded-lg p-3 w-full"
                    disabled={isProcessing}
                />
                <div className="flex gap-4">
                    <input
                        type="text"
                        name="holderPostalCode"
                        placeholder="CEP do Titular*"
                        required
                        value={cardData.holderPostalCode}
                        onChange={onInputChange}
                        className="border rounded-lg p-3 w-2/3"
                        disabled={isProcessing}
                    />
                    <input
                        type="text"
                        name="holderAddressNumber"
                        placeholder="Número*"
                        required
                        value={cardData.holderAddressNumber}
                        onChange={onInputChange}
                        className="border rounded-lg p-3 w-1/3"
                        disabled={isProcessing}
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-3 rounded-lg font-bold bg-purple-500 hover:bg-purple-600 transition disabled:opacity-50 text-white flex items-center justify-center mt-6"
                disabled={isProcessing}
            >
                <span className="mr-2 text-xl">✅</span>
                {isProcessing ? "Processando Pagamento..." : `Pagar R$ ${itemPrice}`}
            </button>
            
            <button
              type="button"
              onClick={handleCloseCheckout} // Fecha todo o fluxo
              className="w-full py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
              disabled={isProcessing}
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    );
  };


  // MUDANÇA 3: Retorno principal com a nova seção de Apresentação e o layout centralizado.
  return (
    <div className="min-h-screen p-4 bg-[#F9FBEE] text-[#201E1E]"> 
      <header className="flex justify-between items-center max-w-7xl mx-auto pb-8">
          <img src={Logo} alt="Logo da Empresa" className="h-20 md:h-22"/>
          <button 
              onClick={handleProfessorLogin} 
              className="font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition text-sm md:text-base" 
              style={{ backgroundColor: "#D8F3DC" }}
          > 
              Login para professor/adm 
          </button>
      </header>

      {/* SEÇÃO DE APRESENTAÇÃO */}
      <div className="max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 md:p-12 rounded-2xl shadow-xl border" style={{ borderColor: "#A9CBD2" }}>
            {/* Coluna 1: Texto e Botões */}
            <div className="flex flex-col space-y-6">
                <h1 className="text-3xl font-bold text-[#201E1E]">Francielli Fagundes</h1>
                <div className=" text-gray-700">
                    <p className="text-lg leading-relaxed">
                        Francielli Fagundes é empresária, psicóloga, psicanalista e perita judicial em Santa Catarina. Atua com dedicação nas áreas da saúde mental e jurídica, unindo experiência clínica e pericial.
                    </p>
                    <p className="text-lg leading-relaxed">
                        Paralelamente, construiu uma sólida trajetória na dança, iniciada aos 5 anos com o ballet clássico, prática que manteve até os 14 anos. Também vivenciou a cultura dos CTGs (Centros de Tradição Gaúcha) e segue, até hoje, envolvida com a dança de salão. Domina diversos ritmos, como bachata, forró, sertanejo, salsa, maxixe gaúcho, vanera swingada, bolero e zouk brasileiro.
                    </p>

                </div>
                
                {/* 1. NOVO BOTÃO PARA ABRIR O MODAL DE PACOTES (MOVIDO PARA CIMA E RENOMEADO) */}
                <button 
                    onClick={handleOpenPackageList}
                    className="w-full font-bold py-3 px-6 rounded-lg shadow-md hover:scale-[1.02] transition text-white"
                    style={{ backgroundColor: "#A9CBD2" }}
                >
                    Buscar por pacotes de aula
                </button>


                {/* 2. Botões (REORGANIZADOS) */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={handleOpenProfessorList} 
                        className="flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:scale-[1.02] transition text-white"
                        style={{ backgroundColor: "#9AC3CD" }}
                    >
                        Buscar professores
                    </button>
                    <button 
                        onClick={handleOpenSpecialtyList}
                        className="flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:scale-[1.02] transition text-white"
                        style={{ backgroundColor: "#A9CBD2" }}
                    >
                        Buscar por especialidade
                    </button>
                    <button 
                        onClick={handleOpenProductList}
                        className="flex-1 font-bold py-3 px-6 rounded-lg shadow-md hover:scale-[1.02] transition text-white"
                        style={{ backgroundColor: "#9AC3CD" }}
                    >
                        Buscar produtos
                    </button>
                </div>
                
                {/* 3. BLOCO "SOBRE A PLATAFORMA" (MOVIDO PARA DEPOIS DOS BOTÕES) */}
                <div className="bg-[#EAF5F7] p-2 rounded-lg border-l-4 border-[#A9CBD2]">
                    <p className="text-lg font-semibold text-[#201E1E]">
                        Sobre a Plataforma:
                    </p>
                    <p className="text-base text-gray-700 mt-1">
                        Esta plataforma é o ponto de encontro de diversos especialistas qualificados nas mais variadas áreas da dança, prontos para te ajudar a aprofundar seus conhecimentos e aprimorar seus movimentos através de aulas particulares.
                    </p>
                </div>
            </div>

            {/* Coluna 2: Imagem */}
            <div className="order-first md:order-last flex justify-center items-center">
                <div className="w-full max-w-xs md:max-w-md h-96 rounded-xl shadow-2xl overflow-hidden" style={{ borderColor: "#A9CBD2", border: "1px solid" }}>
                    <img 
                        src={photo} 
                        alt="Francielli Fagundes - Empresária, Psicóloga e Dançarina" 
                        className="w-full h-full object-cover object-top" 
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Modal para a Lista de Professores (Visão Geral) */}
      <ListModal 
        isOpen={showProfessorListModal} 
        onClose={handleCloseAllModals}
      >
        {renderProfessorListContent()}
      </ListModal>
      
      {/* Modal para a Lista de Especialidades (Visão por Especialidade) */}
      <ListModal 
        isOpen={showSpecialtyListModal} 
        onClose={handleCloseAllModals}
      >
        {renderSpecialtyListContent()}
      </ListModal>

      {/* Modal para a Lista de Produtos (Modal Separado) */}
      <ListModal 
        isOpen={showProductModal} 
        onClose={handleCloseAllModals}
      >
        {renderProductListContent()}
      </ListModal>
      
      {/* NOVO: Modal para a Lista de Pacotes (Implementação solicitada) */}
      <ListModal 
        isOpen={showPackageModal} 
        onClose={handleCloseAllModals}
      >
        {renderPackagesContent()}
      </ListModal>
      
      {/* Modal de Checkout (Fundo alterado para branco semi-transparente) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4 z-50">
          {/* ALTERADO: p-6 para p-4 sm:p-6 para melhor responsividade em mobile */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-4">
              {selectedProfessor ? "Agendamento de Aula" : (selectedPackage ? "Adquirir Pacote" : "Finalizar Compra")}
            </h3>
            <p className="mb-4">
              Item: 
              <span className="font-semibold ml-1">
                {selectedProfessor 
                    ? `${selectedProfessor.name} (${selectedSpecialty.typeDance})`
                    : selectedPackage
                        ? selectedPackage.packageName
                        : selectedProduct?.name
                }
              </span>
            </p>
            <p className="text-xl font-extrabold mb-6 text-blue-500">
              Valor: R$ {parseFloat(selectedSpecialty?.pricePerClass || selectedPackage?.price || selectedProduct?.price || 0).toFixed(2)}
            </p>

            <>
                {/* Se for professor, exige os dados para o PIX/Checkout */}
                {/* O input de dados foi expandido para o fluxo de professor, pois o PIX precisa de nome, email e CPF */}
                <div className="space-y-4 mb-6">
                    <p className="text-lg font-semibold text-[#201E1E]">Dados do Comprador (Para Pagamento):</p>
                    {["name", "email", "cpf", "phone", "address", "postalCode"].map((field) => {
                        const isProfessorFlow = !!selectedProfessor;
                        // Campos obrigatórios para PIX/Cartão de Aula (Nome, Email, CPF)
                        const requiredForClass = ["name", "email", "cpf"].includes(field);
                        // Campos obrigatórios para Produto/Pacote (Nome, Email, CPF, Endereço, CEP)
                        const requiredForProduct = ["name", "email", "cpf", "address", "postalCode"].includes(field);
                            
                        const isRequired = isProfessorFlow ? requiredForClass : requiredForProduct;

                        // Se for fluxo de aula, não exibe Endereço e CEP
                        if (isProfessorFlow && (field === "address" || field === "postalCode")) return null;
                        
                        // Se for fluxo de produto, o telefone é opcional.
                        if (!isProfessorFlow && field === "phone") return null;

                        return (
                          <input
                            key={field}
                            type={field === 'email' ? 'email' : 'text'}
                            name={field}
                            placeholder={
                                field === 'name' ? 'Nome Completo*' : 
                                field === 'email' ? 'E-mail*' : 
                                field === 'cpf' ? 'CPF*' : 
                                field === 'phone' ? 'Telefone' : 
                                field === 'address' ? 'Endereço Completo (Rua, Número, Bairro)*' :
                                'CEP*' // postalCode
                            }
                            required={isRequired}
                            value={buyerData[field]}
                            onChange={handleInputChange}
                            className="border rounded-lg p-3 w-full"
                            disabled={isProcessingPayment}
                          />
                        );
                    })}
                    <p className="text-sm text-gray-500">* Campos obrigatórios. Os campos Endereço e CEP são obrigatórios apenas para a compra de Produtos/Pacotes.</p>
                </div>

                {/* Botões */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleConfirmPayment} // AGORA ABRE O MODAL DE PIX/CARTÃO
                    className="w-full py-3 rounded-lg font-bold bg-[#9AC3CD] hover:scale-105 transition disabled:opacity-50 text-white"
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment 
                        ? "Validando Dados..." 
                        : "Prosseguir para o Pagamento"
                    }
                  </button>
                  <button
                    onClick={handleCloseCheckout}
                    className="w-full py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
                    disabled={isProcessingPayment}
                  >
                    Cancelar
                  </button>
                </div>
            </>
          </div>
        </div>
      )}
      
      {/* NOVO: Modal de Seleção de Método de Pagamento (Pix ou Cartão) */}
      <PaymentMethodModal
        isOpen={showPaymentMethodModal}
        onClose={handleCloseCheckout}
        onSelectMethod={handleProcessPayment}
        isProcessing={isProcessingPayment}
      />
      
      {/* NOVO: Modal de Exibição do PIX */}
      <PixModal
        isOpen={showPixModal}
        onClose={handleCloseCheckout}
        encodedImage={pixData.encodedImage}
        payload={pixData.payload}
        isPolling={isPollingPaymentStatus}
        totalValue={pixData.totalValue}
        freteValue={pixData.freteValue}
      />
      
      {/* NOVO: Modal de Formulário do Cartão de Crédito */}
      <CreditCardModal
        isOpen={showCreditCardModal}
        onClose={handleCloseCheckout}
        cardData={cardData}
        onInputChange={handleCardInputChange}
        onSubmit={handleCardPaymentSubmit}
        isProcessing={isProcessingPayment}
      />
    </div>
  );
};

export default HomePage;