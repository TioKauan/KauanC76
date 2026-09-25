import { iniciarMoldura } from './moldura';
import { iniciarBarra } from './barra';
import { iniciarAbertura } from './abertura';
import { iniciarPlanos } from './planos';
import { iniciarConfigurador } from './configurador';
import { iniciarComoFunciona } from './como-funciona';

// A barra fixa começa antes para receber o primeiro resumo do configurador.
iniciarMoldura();
iniciarBarra();
iniciarAbertura();
iniciarPlanos();
iniciarConfigurador();
iniciarComoFunciona();
