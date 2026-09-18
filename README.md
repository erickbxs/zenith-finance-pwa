# 🍎 Zenit Finance (PWA)

> **Gerenciador Financeiro Pessoal Estilo Apple (iOS / iPadOS / macOS)**  
> *Previsibilidade de Longo Prazo, Faturas Inteligentes de Cartão de Crédito e Câmbio Multimoeda (BRL / USD / PYG)*  
> **100% Local-First • Zero Data Leakage • Air-Gapped • Web Crypto AES-GCM 256-bit**

---

## 🛡️ Destaques de Segurança & Arquitetura Air-Gapped

- **Zero Data Leakage (Air-Gapped by Design):** Nenhuma transação, fatura, saldo, limite ou credencial é transmitida para servidores externos.
- **Sem APIs Externas ou Rastreadores:** Todo o aplicativo opera de forma isolada no navegador. O módulo de cotação cambial opera de forma **100% manual**, sem requisições a serviços de cotação externa (`fetch` / `axios` / trackers bloqueados).
- **Criptografia Militar Client-Side (Web Crypto API):**
  - Cifra: **AES-GCM de 256 bits**.
  - Derivação de Chave Mestra: **PBKDF2** com **HMAC-SHA-256** e **100.000 iterações**.
  - Vetores de Inicialização (IV) e Salts aleatórios de 16/12 bytes gerados criptograficamente (`crypto.getRandomValues`).
  - Suporte a **Backups Criptografados (.aes.json)** protegidos por senha mestra.
- **Content Security Policy (CSP) Rigorosa:** Bloqueia conexões de rede não autorizadas (`connect-src 'self'`).
- **Sanitização de Entradas (Anti-XSS):** Filtro e escape de caracteres perigosos em títulos de transações e cartões.

---

## ✨ Funcionalidades Principais

1. **Design System Fiel às Human Interface Guidelines (HIG) da Apple:**
   - Visual nativo de iOS/iPadOS otimizado para iPhone 13, iPad 10ª geração e telas ultrawide.
   - Suporte a **Modo Escuro (Azul Noturno Profundo `#0B132B` / `#1C2541`)** e **Modo Claro (Cinza Suave `#F2F2F7` / `#FFFFFF`)**.
   - Efeitos de desfoque de vidro (*acrylic blur/frosted glass*), bordas ultrafinas (*hairline borders*) e cantos arredondados contínuos.

2. **Linha do Tempo e Previsão Futura (6 a 24 Meses):**
   - Planejamento plurianual com visão consolidada mês a mês.
   - Visualizações customizáveis em **Accordion**, **Carrossel Horizontal** ou **Grid de Cartões**.
   - Anel de progresso financeiro e cálculo automático de saldo acumulado.

3. **Gestão Inteligente de Faturas de Cartão de Crédito:**
   - Cadastro de múltiplos cartões (com dia de fechamento da fatura e dia de vencimento).
   - **Algoritmo de Fechamento de Fatura:** Lançamentos feitos a partir do dia de fechamento são computados automaticamente na fatura do mês subsequente.
   - Barras de consumo de limite com código de cores (Verde, Amarelo e Vermelho para >80% de uso).

4. **Conversão Multimoeda Manual (USD / PYG / BRL):**
   - Permite lançamentos em Dólares Americanos (USD), Guaranis Paraguaios (PYG) e Reais (BRL).
   - Normalização automática para BRL baseada na taxa manual fixada pelo usuário.
   - Carimbo visível de **"Último Ajuste Manual"** (data e hora).

5. **Backup, Restauração e Portabilidade:**
   - Exportação e importação de dados em formato JSON aberto ou JSON Criptografado com Senha.

---

## 📲 Como Instalar e Rodar o App nos Dispositivos Móveis (PWA)

O **Zenit Finance** foi construído com arquitetura PWA de última geração. Isso significa que ele roda diretamente no seu smartphone sem precisar passar pelas lojas de aplicativos e sem pagar taxas da App Store/Play Store, com suporte offline nativo.

### No iPhone e iPad (iOS / iPadOS via Safari)
1. Abra o link do aplicativo no **Safari** (ex: a URL compartilhada do app ou seu domínio próprio).
2. Toque no ícone de **Compartilhar** (quadrado com a seta apontando para cima na barra de navegação).
3. Role o menu para baixo e toque em **"Adicionar à Tela de Início"** (*Add to Home Screen*).
4. O Safari preencherá o ícone de alta resolução e o nome **"Zenit Finance"**. Toque em **Adicionar** no canto superior direito.
5. Pronto! O ícone do **Zenit Finance** estará na sua tela inicial e abrirá em modo 100% tela cheia nativo, isolado do navegador, com animações táteis estilo iOS.

### No Android (Google Chrome / Samsung Internet / Edge)
1. Acesse o link do aplicativo no **Google Chrome**.
2. Um aviso flutuante **"Adicionar Zenit Finance à tela inicial"** ou o botão **"Instalar App"** aparecerá na tela.
3. Se preferir, toque nos **três pontos (⋮)** no canto superior direito e selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. Confirme a instalação. O app será adicionado à sua gaveta de aplicativos com suporte a inicialização offline instantânea.

---

## 💻 Guia de Instalação e Desenvolvimento Local (VS Code)

### Pré-requisitos
- **Node.js**: versão 18.0.0 ou superior ([Download Node.js](https://nodejs.org/))
- **npm** ou **yarn** / **pnpm**
- **Git** instalado no sistema ([Download Git](https://git-scm.com/))
- **Visual Studio Code** ([Download VS Code](https://code.visualstudio.com/))

### 1. Clonando e Abrindo no VS Code
Abra o seu terminal (Prompt de Comando, PowerShell ou Terminal do macOS/Linux) e execute:

```bash
# Clone o repositório para o seu computador
git clone https://github.com/SEU-USUARIO/zenit-finance.git

# Acesse a pasta do projeto
cd zenit-finance

# Abra o projeto no VS Code
code .
```

### 2. Instalando as Dependências
Dentro do terminal integrado do VS Code (`Ctrl + \`` ou `Cmd + \``), instale as dependências:

```bash
npm install
```

### 3. Executando em Ambiente de Desenvolvimento
Inicie o servidor de desenvolvimento local:

```bash
npm run dev
```

Abra o seu navegador e acesse:
```
http://localhost:3000
```

### 4. Compilação para Produção
Para gerar a versão otimizada para publicação:

```bash
npm run build
```

Os arquivos compilados estáticos e prontos para qualquer servidor web ou CDN local serão gerados na pasta `dist/`.

---

## 🚀 Como Publicar em Produção Gratuitamente

Você pode colocar o **Zenit Finance** no ar em menos de 2 minutos utilizando provedores modernos de hospedagem estática gratuitos (com SSL automático e alta velocidade global):

### Opção A: Vercel (Recomendado - 1 Clique)
1. Crie uma conta gratuita em [vercel.com](https://vercel.com).
2. Clique em **"Add New Project"** e importe o seu repositório `zenit-finance` do GitHub.
3. A Vercel detectará automaticamente o Vite. Clique em **"Deploy"**.
4. Em menos de 1 minuto, você receberá um link HTTPS global (ex: `zenit-finance.vercel.app`) pronto para você e sua família instalarem no celular!

### Opção B: GitHub Pages
1. No seu repositório do GitHub, vá em **Settings** > **Pages**.
2. Em **Source**, selecione **GitHub Actions**.
3. Adicione o workflow de build do Vite para publicar a pasta `dist/` automaticamente a cada commit.

### Opção C: Cloudflare Pages ou Netlify
- Basta conectar o repositório Git, definir o comando de build como `npm run build` e a pasta de saída como `dist`.

---

## 🐙 Como Exportar e Criar um Novo Repositório no GitHub

Siga este passo a passo para hospedar o código no seu próprio perfil do GitHub:

### Passo 1: Criar um Repositório Vazio no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Escolha o nome do repositório: `zenit-finance`.
3. Deixe o repositório como **Privado** (recomendado para seus dados ou configurações pessoais) ou **Público**.
4. **IMPORTANTE:** Não marque as opções "Add a README file", ".gitignore" ou "Choose a license" (pois o projeto já possui esses arquivos configurados).
5. Clique em **"Create repository"**.

### Passo 2: Inicializar o Git e Publicar Localmente
No terminal da pasta do seu projeto local:

```bash
# 1. Inicialize o repositório Git local (caso ainda não tenha sido inicializado)
git init

# 2. Adicione todos os arquivos respeitando o .gitignore blindado
git add .

# 3. Crie o primeiro commit estrutural
git commit -m "feat: initial release - zenit finance pwa air-gapped apple hig"

# 4. Defina o branch principal como main
git branch -M main

# 5. Conecte o repositório local ao GitHub (substitua pelo link do seu repositório)
git remote add origin https://github.com/SEU-USUARIO/zenit-finance.git

# 6. Envie o código para o GitHub
git push -u origin main
```

---

## 🧩 Extensões Recomendadas para o VS Code

Para uma experiência de desenvolvimento ideal, recomendamos instalar as seguintes extensões no VS Code (configuradas em `.vscode/extensions.json`):

1. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - Autocompletion inteligente de classes de utilidade.
2. **ESLint** (`dbaeumer.vscode-eslint`) - Análise estática e garantia de qualidade de código.
3. **Prettier - Code formatter** (`esbenp.prettier-vscode`) - Padronização e formatação automática.

---

## 🔒 Auditoria de Segurança & Boas Práticas

| Recurso | Implementação | Finalidade |
|---|---|---|
| **Exfiltração de Rede** | Nula (Air-Gapped) | Nenhuma requisição a servidores de terceiros ou nuvens |
| **Câmbio Cambial** | Estritamente Manual | Elimina requisições periódicas a APIs de câmbio públicas |
| **Criptografia de Backup** | Web Crypto API (AES-GCM) | Protege os backups exportados com senha mestre derivada via PBKDF2 |
| **Proteção XSS** | Sanitizador de Entidades | Evita injeção maliciosa em descrições de lançamentos |
| **CSP** | Content-Security-Policy | Impede carregamento de scripts externos ou conexões desconhecidas |
| **Privacidade** | Local-First Storage | Armazenamento no navegador do usuário sem contas na nuvem |

---

## 📄 Licença
Distribuído sob licença MIT. Consulte o arquivo `LICENSE` para mais informações.
