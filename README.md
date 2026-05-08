# Super CEP

> Formulário de consulta e cadastro de endereço por CEP, construído com Next.js 16, TypeScript e Tailwind CSS.

🔗 **Deploy:** [test-super-cep.vercel.app](https://test-super-cep.vercel.app/)

---

## Preview

| Light Mode | Dark Mode |
|:---:|:---:|
| ![Light Mode](./docs/light.png) | ![Dark Mode](./docs/dark.png) |

---

## Tecnologias

| Camada | Biblioteca |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS 4 |
| Formulários | React Hook Form 7 + @hookform/resolvers |
| Validação | Yup 1 |
| Requisições assíncronas | TanStack Query 5 |
| Cache server-side | Redis (ioredis) |
| HTTP | Axios |

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.local.example .env.local
# edite .env.local e preencha REDIS_URL

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no navegador.

```bash
# Build de produção
npm run build
npm start
```

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `REDIS_URL` | String de conexão Redis — ex: `redis://:senha@host:porta` |

> No Vercel, adicione `REDIS_URL` em **Settings → Environment Variables** antes do deploy.

---

## Funcionalidades

**Consulta de CEP**
- Ao sair do campo CEP (blur), a busca é disparada automaticamente
- A requisição passa pelo servidor Next.js, que consulta o Redis antes de chamar APIs externas
- API primária: [ViaCEP](https://viacep.com.br/)
- Fallback automático: [BrazilAPI](https://brasilapi.com.br/) — ativado somente se o ViaCEP falhar
- Resultado cacheado no Redis por **1 dia** (TTL 86 400 s) e no cliente por 10 minutos via TanStack Query

**Formulário**
- Campos: CEP, Logradouro, Complemento, Bairro, Cidade e Estado
- Máscara automática no campo CEP (`00000-000`)
- Estado convertido automaticamente para maiúsculas (sigla UF)
- Validação com Yup: campos obrigatórios, limites de caracteres e formato de CEP

**Ações**
- **Limpar** — reseta todos os campos e o estado da consulta
- **Salvar** — envia os dados para a API interna e os armazena em `data/addresses.json`
- **Detecção de duplicatas** — ao tentar salvar um CEP já cadastrado, exibe alerta com confirmação antes de prosseguir

**Interface**
- Dark mode com toggle lua/sol — preferência persiste via `localStorage` e respeita a configuração do sistema na primeira visita
- Layout responsivo para mobile e desktop

---

## Requisitos originais do Teste

- [x] Consumer de API pelo ViaCEP
- [x] Formulário com CEP, Logradouro, Complemento, Bairro, Cidade e Estado
- [x] Validação de campos (tipagem e controle de caracteres)
- [x] Preenchimento automático ao sair do campo CEP
- [x] Botão LIMPAR zera todos os campos
- [x] Botão SALVAR persiste os dados em arquivo JSON
- [x] Stack utilizada Next.js/TypeScript

## Requisitos adicionais implementados

- [x] React Hook Form + @hookform/resolvers
- [x] Fallback para BrazilAPI quando ViaCEP falha
- [x] TanStack Query para gerenciamento de estado assíncrono e cache
- [x] Cache server-side com Redis (TTL 1 dia) via singleton ioredis
- [x] Detecção e confirmação de endereços duplicados
- [x] Responsividade para mobile
- [x] Dark mode com persistência de preferência
