## Deployando para a DigitalOcean

Com o `azk`, deployar para a [DigitalOcean][digital_ocean] é muito simples.

O primeiro passo é configurar as chaves SSH em sua máquina. Elas vão ser úteis para fazermos a conexão ao droplet e para enviarmos os arquivos de seu projeto. Se você ainda não tem chaves SSH criadas em sua máquina (ou não tem certeza sobre isso), siga os passos 1 e 2 [deste tutorial](https://help.github.com/articles/generating-ssh-keys/).

Em seguida, adicione o sistema `deploy` ao seu `Azkfile.js`:

```
systems({
  // ...

  deploy: {
    image: {"docker": "azukiapp/deploy-digitalocean"},
    mounts: {
      "/azk/deploy/src" : path("."),
      "/azk/deploy/.ssh": path("#{env.HOME}/.ssh"),
    },
    scalable: {"padrão": 0, "limit": 0},
  },
  envs: {
    // Adicione aqui as opções de configuração do deploy
  }
});
```

Depois, adicione os seguintes `http.domains` ao seu sistema principal:

```
systems({
  'my-app': {
    // ...
    http: {
      domains: [
        "#{env.HOST_DOMAIN}",
        "#{env.HOST_IP}"
        // ...
      ]
    },
  },

  // ...
});
```

Obtenha uma chave de acesso (personal access token) da DigitalOcean (via [este link](https://cloud.digitalocean.com/settings/applications)) e coloque-o em um arquivo chamado `.env`:

```bash
$ cd path/to/the/project
$ echo "DEPLOY_API_TOKEN=<YOUR-PERSONAL-ACCESS-TOKEN>" >> .env
```

Por fim, basta rodar o seguinte comando:

```bash
$ azk shell deploy
```

Você pode alterar as configurações do deploy adicionando opções no objeto `env`. As opções disponíveis são:

- **DEPLOY_API_TOKEN**: User's API token in [DigitalOcean](https://cloud.digitalocean.com/settings/applications
);
- **BOX_NAME** (*opcional, padrão: `$AZK_MID || azk-deploy`*): Nome do droplet;
- **BOX_REGION** (*opcional, padrão: nyc3*): Região onde o droplet será alocado. Veja todas as regiões disponíveis se seus nomes `slug` correspondentes [aqui](https://developers.digitalocean.com/documentation/v2/#list-all-regions);
- **BOX_IMAGE** (*opcional, padrão: ubuntu-14-04-x64*): Nome da imagem usada no droplet. O padrão é Ubuntu 14.04 x86-64 e **nós recomendamos fortemente que você a use**. Veja todas as imagens disponíveis e seus nomes `slug` correspondentes [aqui](https://developers.digitalocean.com/documentation/v2/#list-all-distribution-images);
- **BOX_SIZE** (*opcional, padrão: 1gb*): Tamanho do droplet (envolve o número de CPUs, quantidade de memória RAM, capacidade de armazenamento e tráfego de dados). Veja todos os tamanhos de droplet disponíveis e seus nomes `slug` correspondentes [aqui](https://developers.digitalocean.com/documentation/v2/#list-all-sizes);
- **BOX_BACKUP** (*opcional, padrão: false*): Se `true`, habilita o [backup do droplet na DigitalOcean](https://www.digitalocean.com/help/technical/backup/);
- **BOX_PRIVATE_NETWORKING** (*opcional, padrão: false*): Se `true`, habilita para o droplet o acesso à [rede privada da DigitalOcean naquela região](https://www.digitalocean.com/company/blog/introducing-private-networking/);
- **LOCAL_PROJECT_PATH** (*opcional, padrão: /azk/deploy/src*): Caminho do código fonte do projeto dentro do container de deploy;
- **LOCAL_DOT_SSH_PATH** (*opcional, padrão: /azk/deploy/.ssh*): Caminho da pasta onde estão armazenadas as chaves SSH dentro do container de deploy. Caso nenhuma chave seja passada ao container, um novo par de chaves SSH será criado;
- **REMOTE_USER** (*opcional, padrão: git*): Nome do usuário a ser criado (ou utilizado, caso já exista) no servidor remoto;
- **AZK_DOMAIN** (*opcional, padrão: azk.dev.io*): Domínio do azk no namespace atual;
- **HOST_DOMAIN** (*opcional*): Domínio com o qual a aplicação poderá ser acessada;
- **REMOTE_PROJECT_PATH_ID** (*opcional*): Por padrão, o projeto será criado na pasta */home/`REMOTE_USER`/`REMOTE_PROJECT_PATH_ID`* (i.e., `REMOTE_PROJECT_PATH`) no servidor remoto. Se nenhum valor for informado, um valor aleatório será gerado;
- **REMOTE_PROJECT_PATH** (*opcional*): Caminho onde o projeto será armazenado no servidor remoto. Se nenhum valor for informado, o valor utilizado será */home/`REMOTE_USER`/`REMOTE_PROJECT_PATH_ID`*;
- **RUN_SETUP** (*opcional, padrão: true*): Variável booleana que define se a configuração do servidor remoto deve ser executada;
- **RUN_DEPLOY** (*opcional, padrão: true*): Variável booleana que define se o passo de deploy da aplicação deve ser executado;
- **DISABLE_ANALYTICS_TRACKER** (*opcional, padrão: false*): Variável booleana que define se o azk deve ou não coletar dados analíticos anonimamente;

!INCLUDE "../../links.md"
