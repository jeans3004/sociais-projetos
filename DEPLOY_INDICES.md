# Deploy dos Índices do Firestore

## Problema
O sistema de rifas está retornando erro 500 porque faltam índices compostos no Firestore.

## Solução

### Opção 1: Deploy Automático (Recomendado)

Execute os comandos abaixo para fazer deploy dos índices:

```bash
# Autenticar no Firebase (se necessário)
firebase login

# Deploy apenas dos índices do Firestore
firebase deploy --only firestore:indexes
```

Aguarde alguns minutos para os índices serem criados automaticamente.

### Opção 2: Criar Índices Manualmente

Acesse os links abaixo para criar os índices diretamente no Console do Firebase:

1. **Índice para donations (campaignId + createdAt)**
   ```
   https://console.firebase.google.com/v1/r/project/sociais-projetos/firestore/indexes?create_composite=ClJwcm9qZWN0cy9zb2NpYWlzLXByb2pldG9zL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9kb25hdGlvbnMvaW5kZXhlcy9fEAEaDgoKY2FtcGFpZ25JZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
   ```

2. **Índice para raffleDraws (campaignId + createdAt)**
   ```
   https://console.firebase.google.com/v1/r/project/sociais-projetos/firestore/indexes?create_composite=ClRwcm9qZWN0cy9zb2NpYWlzLXByb2pldG9zL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9yYWZmbGVEcmF3cy9pbmRleGVzL18QARoOCgpjYW1wYWlnbklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
   ```

Clique em cada link e depois clique em "Criar índice".
Aguarde a construção dos índices (geralmente leva alguns minutos).

## Índices Criados

Os seguintes índices compostos foram definidos no arquivo `firestore.indexes.json`:

1. **donations**: `campaignId` (ASC) + `createdAt` (DESC)
2. **raffleDraws**: `campaignId` (ASC) + `createdAt` (DESC)
3. **tickets**: `campaignId` (ASC) + `ticketNumber` (ASC)
4. **studentCampaignStats**: `campaignId` (ASC) + `ticketsAssigned` (DESC)

## Verificação

Após o deploy, teste novamente registrando uma rifa. O erro 500 deve desaparecer.

## Observações

- Os índices são criados apenas uma vez e ficam disponíveis permanentemente
- A primeira criação pode levar alguns minutos dependendo do volume de dados
- Você pode acompanhar o progresso na aba "Índices" do Console do Firestore
