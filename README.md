# best-segmentator-game




## Instruções para setup do projeto


Primeiramente, você precisa baixar os checkpoints do SAM [aqui](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth) e colocá-lo na pasta `sam-server`.

### Inicialização 
1. Clonar o repositório

2. Iniciar o docker

```bash
docker-compose up -d 
```
### Setup da competição: 

1. Alterar a constante 'groupFolder' no arquivo 'web-server/server.js' para o nome da pasta de imagens da competição. Coloque essa pasta no caminho 'sam-server/images'

2. Acessar a página 'http://localhost:4002/adm' caso queira reiniciar os rankings 