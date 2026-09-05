import { failure, success } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { cleanCNPJ, isValidCNPJ } from "@/lib/validators/cnpj";
import { withLogging } from "@/lib/api-middleware";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ cnpj: string }>;
};

export const GET = withLogging(async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAuth();
    const { cnpj: rawCnpj } = await context.params;
    const cnpj = cleanCNPJ(decodeURIComponent(rawCnpj));

    if (cnpj.length !== 14 || !isValidCNPJ(cnpj)) {
      return failure("CNPJ inválido.", 400);
    }

    // Consulta BrasilAPI com timeout de 6 segundos
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Register.io-Integration/1.0",
        },
      });

      clearTimeout(timeout);

      if (response.status === 404) {
        return failure("CNPJ não encontrado na base da Receita Federal.", 404);
      }

      if (!response.ok) {
        return failure("Serviço de consulta de CNPJ temporariamente indisponível.", 502);
      }

      const data = await response.json();

      return success({
        cnpj: data.cnpj,
        razaoSocial: data.razao_social || "",
        nomeFantasia: data.nome_fantasia || "",
        email: data.email || null,
        telefone: data.ddd_telefone_1 || data.ddd_telefone_2 || null,
        situacaoCadastral: data.descricao_situacao_cadastral || "",
        cnaePrincipal: data.cnae_fiscal_descricao || "",
        logradouro: data.logradouro || "",
        numero: data.numero || "",
        bairro: data.bairro || "",
        municipio: data.municipio || "",
        uf: data.uf || "",
        cep: data.cep || "",
      });
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        return failure("Tempo limite excedido ao consultar CNPJ.", 504);
      }
      throw err;
    }
  } catch (error) {
    return failure("Falha interna ao consultar dados do CNPJ.", 500);
  }
});
