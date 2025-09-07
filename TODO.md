# TODO - Leitor de QR Code Pix

## Funcionalidades a Implementar
- [ ] Adicionar suporte para outros tipos de QR code (não apenas Pix)
- [ ] Implementar validação adicional para códigos Pix (verificar campos obrigatórios)
- [ ] Adicionar funcionalidade de exportar códigos escaneados (JSON/CSV)
- [ ] Implementar histórico de códigos escaneados com armazenamento local
- [ ] Adicionar opção de alternar entre tema escuro e claro
- [ ] Suporte para múltiplas câmeras simultâneas (se disponível)
- [ ] Adicionar funcionalidade de zoom na câmera
- [ ] Implementar detecção automática de QR code na câmera (sem botão iniciar)

## Melhorias de UX/UI
- [ ] Melhorar responsividade para dispositivos móveis
- [ ] Adicionar animações de carregamento durante processamento
- [ ] Implementar notificações toast em vez de alert()
- [ ] Adicionar preview em tempo real do vídeo da câmera
- [ ] Melhorar feedback visual para estados de erro
- [ ] Adicionar atalhos de teclado (ex: Ctrl+V para colar código)
- [ ] Implementar drag-and-drop para upload de arquivos

## Otimização e Performance
- [ ] Otimizar processamento de PDFs grandes (paginação ou worker threads)
- [ ] Implementar cache para bibliotecas externas (jsQR, PDF.js)
- [ ] Adicionar compressão de imagens antes do processamento
- [ ] Melhorar detecção de QR code com algoritmos mais avançados
- [ ] Implementar lazy loading para recursos

## Testes e Qualidade
- [ ] Adicionar testes unitários para funções utilitárias
- [ ] Implementar testes de integração para funcionalidades principais
- [ ] Adicionar testes de acessibilidade (WCAG)
- [ ] Criar casos de teste para diferentes formatos de QR code Pix
- [ ] Implementar CI/CD básico com GitHub Actions

## Segurança e Privacidade
- [ ] Revisar permissões de câmera e armazenamento
- [ ] Adicionar sanitização de dados de entrada
- [ ] Implementar limpeza automática de dados temporários
- [ ] Adicionar opção de processar arquivos localmente sem upload

## Documentação
- [ ] Criar documentação técnica detalhada das APIs utilizadas
- [ ] Adicionar exemplos de uso avançado
- [ ] Criar guia de contribuição para desenvolvedores
- [ ] Documentar limitações conhecidas do projeto

## Internacionalização
- [ ] Adicionar suporte para múltiplos idiomas (inglês, espanhol)
- [ ] Implementar formatação de moeda baseada na localização
- [ ] Adicionar validação de QR code para outros sistemas de pagamento regionais
