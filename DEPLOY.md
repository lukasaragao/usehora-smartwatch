# Deploy — UseHora Smartwatch

## Variáveis de Ambiente (Vercel)

| Variável | Descrição | Onde obter |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | Neon → Project → Connection String |
| `AUTH_SECRET` | Segredo para Auth.js | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL completa da aplicação | Ex: `https://seudominio.com` |
| `GOOGLE_CLIENT_ID` | OAuth Google | console.cloud.google.com |
| `GOOGLE_CLIENT_SECRET` | OAuth Google | console.cloud.google.com |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de produção (APP_USR-...) | mercadopago.com.br/developers |
| `MERCADOPAGO_PUBLIC_KEY` | Chave pública | mercadopago.com.br/developers |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud | cloudinary.com → Dashboard |
| `CLOUDINARY_API_KEY` | Chave API | cloudinary.com → Dashboard |
| `CLOUDINARY_API_SECRET` | Segredo API | cloudinary.com → Dashboard |
| `RESEND_API_KEY` | Chave API e-mail | resend.com → API Keys |
| `EMAIL_FROM` | E-mail remetente | Ex: `noreply@seudominio.com` |
| `NEXT_PUBLIC_URL` | URL pública da app | Ex: `https://seudominio.com` |
| `UPSTASH_REDIS_REST_URL` | Redis (opcional) | upstash.com |
| `UPSTASH_REDIS_REST_TOKEN` | Redis (opcional) | upstash.com |

## Deploy na Vercel

1. Faça push do repositório para o GitHub
2. Acesse vercel.com → "Add New Project" → importe o repositório
3. Configure todas as variáveis de ambiente acima
4. Em "Build & Development Settings", o framework será detectado automaticamente
5. Clique em "Deploy"

## Migration em Produção

Após o primeiro deploy, rode no terminal local apontando para o banco de produção:

```bash
npx prisma migrate deploy
```

## Tornar usuário ADMIN

Após fazer login pela primeira vez em produção:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'seuemail@gmail.com';
```

## Checklist Go-Live

- [ ] Todas as variáveis de ambiente configuradas na Vercel
- [ ] Domínio próprio apontando para Vercel (DNS configurado)
- [ ] Certificado SSL ativo (automático na Vercel)
- [ ] Redirect URI do Google OAuth atualizado para o domínio de produção
- [ ] Mercado Pago em modo produção (token APP_USR-...)
- [ ] Webhook do Mercado Pago configurado: `https://seudominio.com/api/webhooks/mercadopago`
- [ ] E-mail de domínio verificado no Resend
- [ ] `npx prisma migrate deploy` rodado em produção
- [ ] Usuário admin promovido no banco de produção
- [ ] Teste de compra completo com cartão real (valor mínimo)
- [ ] Smoke test: home, listagem, produto, checkout, admin
