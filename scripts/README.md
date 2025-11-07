# Guia de Migração de Produtos

## 📝 Alterações nos Tipos de Produtos

Os seguintes produtos foram separados em itens individuais:

### Antes:
- ❌ "Açúcar e biscoito" (combinado)
- ❌ "Produtos de higiene e limpeza" (combinado)

### Depois:
- ✅ "Açúcar" (separado)
- ✅ "Biscoito" (separado)
- ✅ "Higiene" (separado)
- ✅ "Limpeza" (separado)

---

## 🔄 Migração de Doações Existentes

As doações antigas que usam os produtos combinados **continuarão funcionando**, mas você pode querer atualizá-las.

### Opção 1: Migração via Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá para Firestore Database
3. Navegue até a collection `donations`
4. Para cada documento que contenha produtos antigos:
   - Clique no documento
   - Edite o campo `products`
   - Substitua manualmente:
     - `"Açúcar e biscoito"` → `"Açúcar"` ou `"Biscoito"`
     - `"Produtos de higiene e limpeza"` → `"Higiene"` ou `"Limpeza"`

### Opção 2: Deixar como está

As doações antigas com produtos combinados:
- ✅ **Continuam válidas** no banco de dados
- ✅ Serão exibidas nos relatórios
- ⚠️ Aparecerão como valores legados

**Novas doações** usarão automaticamente os produtos separados.

---

## 🎯 Impacto da Mudança

### Para Usuários:
- ✅ Formulário de doação agora mostra produtos separados
- ✅ Maior flexibilidade para registrar doações específicas
- ✅ Relatórios mais detalhados

### Para Relatórios:
- ⚠️ Produtos antigos e novos aparecerão separadamente
- 💡 Considere agrupar ao gerar relatórios consolidados

### Para Dashboard:
- ✅ Novos gráficos mostrarão produtos individuais
- 📊 Maior granularidade nos dados

---

## 🛠️ Migração Automática (Opcional)

Se você tem muitas doações e quer migrar automaticamente, crie uma Cloud Function:

```typescript
// Exemplo de Cloud Function para migração
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const migrateProducts = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  const batch = db.batch();

  const donations = await db.collection('donations').get();

  donations.forEach(doc => {
    const products = doc.data().products.map((p: any) => {
      if (p.product === 'Açúcar e biscoito') {
        return { ...p, product: 'Açúcar' };
      }
      if (p.product === 'Produtos de higiene e limpeza') {
        return { ...p, product: 'Higiene' };
      }
      return p;
    });

    batch.update(doc.ref, { products });
  });

  await batch.commit();
  res.send('Migração concluída!');
});
```

---

## ⚠️ Notas Importantes

1. **Backup**: Sempre faça backup antes de migrar dados
2. **Teste**: Teste em ambiente de desenvolvimento primeiro
3. **Reversão**: Mantenha os dados antigos até confirmar que tudo funciona
4. **Gradual**: Não é necessário migrar tudo de uma vez

---

## 📞 Suporte

Para dúvidas sobre a migração, consulte:
- [Documentação do Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
