import { iniciarMoldura } from './moldura.js';
import { iniciarBarra } from './barra.js';
import { iniciarAbertura } from './abertura.js';
import { iniciarPlanos } from './planos.js';
import { iniciarConfigurador } from './configurador.js';
import { iniciarComoFunciona } from './como-funciona.js';

// A barra fixa começa antes para receber o primeiro resumo do configurador.
iniciarMoldura();
iniciarBarra();
iniciarAbertura();
iniciarPlanos();
iniciarConfigurador();
iniciarComoFunciona();
