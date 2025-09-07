# Leitor de QR Code

Um aplicativo web offline para leitura de códigos QR. Suporta leitura via câmera do dispositivo e upload de arquivos (imagens e PDFs).

## ✨ Funcionalidades

- **Leitura via câmera**: Selecione dispositivo de câmera e escaneie códigos QR em tempo real
- **Upload de arquivos**: Suporte para imagens (PNG, JPG, etc.) e PDFs
- **Interface intuitiva**: Design moderno com tema escuro
- **Offline**: Funciona sem conexão com internet (após carregamento inicial)
- **Cópia rápida**: Botão para copiar o código QR para a área de transferência
- **Visualização clara**: Exibe o código QR em chips organizados para fácil leitura

## 🚀 Como Usar

### Opção 1: Via Câmera
1. Abra o arquivo `index.html` em um navegador moderno
2. Na seção "Câmera", selecione o dispositivo desejado (se houver múltiplas câmeras)
3. Clique em "Iniciar" para ativar a câmera
4. Aponte a câmera para um código QR
5. O código será detectado automaticamente e exibido
6. Clique em "Copiar QR" para copiar o código

### Opção 2: Upload de Arquivo
1. Na seção "Upload de arquivo", clique para selecionar um arquivo
2. Escolha uma imagem ou PDF contendo o código QR
3. O arquivo será processado automaticamente
4. Para imagens, uma preview será exibida
5. O código QR será extraído e exibido
6. Use "Copiar QR" para copiar o resultado

## 📋 Requisitos

- Navegador moderno com suporte a:
  - `navigator.mediaDevices.getUserMedia()` (para câmera)
  - `File API` (para upload de arquivos)
  - `Clipboard API` (para cópia)
- Conexão com internet apenas para carregar as bibliotecas externas na primeira vez

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da página
- **CSS3**: Estilização com tema escuro responsivo
- **JavaScript (ES6+)**: Lógica de aplicação
- **jsQR**: Biblioteca para leitura de códigos QR
- **PDF.js**: Biblioteca para processamento de PDFs

## 📁 Estrutura do Projeto

```
qr-code scanner/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos da aplicação
├── js/
│   └── script.js       # Lógica JavaScript
├── TODO.md             # Lista de tarefas pendentes
└── README.md           # Este arquivo
```

## 🔧 Instalação e Execução

1. **Clone ou baixe** os arquivos do projeto
2. **Abra** o arquivo `index.html` em um navegador web
3. **Permita** acesso à câmera quando solicitado (para funcionalidade de câmera)
4. **Pronto!** O aplicativo está funcionando

### Servidor Local (Opcional)

Para desenvolvimento ou testes avançados, você pode servir os arquivos localmente:

```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npx http-server

# Usando PHP
php -S localhost:8000
```

Acesse `http://localhost:8000` no navegador.

## 🎯 Limitações

- Requer permissões de câmera para funcionalidade de vídeo
- PDFs são processados página por página (pode ser lento para documentos grandes)
- Não suporta códigos QR danificados ou de baixa qualidade

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙋 Suporte

Para dúvidas ou sugestões:
- Abra uma issue no repositório
- Verifique a documentação das bibliotecas utilizadas (jsQR, PDF.js)

---

**Nota**: Este é um projeto de código aberto para fins educacionais e pessoais. Use por sua conta e risco.
