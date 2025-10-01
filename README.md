## Como rodar?

### Em Desenvolvimento

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm run dev
```

### Em Produção (na VM)

Para buildar:

```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm run build
```

Para rodar:

```bash
pm2 start "npm run start" --name nextjs
pm2 save
```

Para restartar:

```bash
pm2 restart 0
```

Para checar logs:

```bash
pm2 logs 0
```

Para terminar:

```bash
pm2 stop 0
```

## Padrão Commitizen

<ul>
	<li>feat: adiciona ou remove novas funcionalidades.</li>
	<li>fix: corrige algum bug.</li>
	<li>refactor: commits que reescrevem ou reestruturam o código, porém não alteram o comportamento da aplicação.</li>
	<li>perf: direcionados para melhoria de desempenho.</li>
	<li>style: mudanças no código que não afetam o seu comportamento (ponto e vírgula, espaço em branco, formatação).</li>
	<li>test: adiciona ou corrige testes existentes.</li>
	<li>docs: commits que afetam apenas a documentação.</li>
	<li>build: afeta apenas os componentes de construção (ferramentas, dependências, versão do projeto...).</li>
	<li>ci: afeta apenas os componentes de configuração do CI, arquivos ou scripts (Travis, Circle, BrowserStack, SauceLabs)</li>
	<li>chore: outras mudanças que não afetam o source ou arquivos de teste.</li>
</ul>