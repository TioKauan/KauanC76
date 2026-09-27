import { iniciarMoldura } from './moldura';
import { iniciarBarra } from './barra';
import { iniciarAbertura } from './abertura';
import { iniciarPlanos } from './planos';
import { iniciarConfigurador } from './configurador';
import { iniciarComoFunciona } from './como-funciona';
import { iniciarSol } from './sol';

// Só a página inicial tem as seções interativas. Páginas de texto (como
// /privacidade/) usam o mesmo layout e não podem quebrar procurando o menu.
if (document.querySelector('.menu-botao')) {
  // A barra fixa começa antes para receber o primeiro resumo do configurador.
  iniciarMoldura();
  iniciarBarra();
  iniciarAbertura();
  iniciarPlanos();
  iniciarConfigurador();
  iniciarComoFunciona();
  iniciarSol();
}
