import { listReleases } from "../src/list-releases";
import { Octokit as Core } from "@octokit/core";
import { adjust } from "@ptomulik/octokit-paginate-rest-limit";
import { repr } from "./util";
import fetchMock from "fetch-mock";

function createFetchMock<P>(
  endpoint: string,
  params: P & { per_page?: number },
  entries: unknown[],
  max?: number
) {
  const aParams = max != null ? adjust(max, params) : params;
  const perPage = aParams.per_page || 30;
  const pageUrl =
    aParams.per_page != null
      ? (page: number): string =>
          `${endpoint}?page=${page}&per_page=${aParams.per_page}`
      : (page: number): string => `${endpoint}?page=${page}`;

  let sandbox = fetchMock.sandbox();
  let remain = entries.length;

  if (aParams.per_page != null) {
    sandbox = sandbox.get(`${endpoint}?per_page=${aParams.per_page}`, {
      body: entries.slice(0, perPage),
      headers:
        remain > perPage
          ? {
              link: `<${pageUrl(2)}>; rel="next"`,
              "x-github-media-type": "github.v3; format=json",
            }
          : {},
    });
  } else {
    sandbox = sandbox.get(endpoint, {
      body: entries.slice(0, perPage),
      headers:
        remain > perPage
          ? {
              link: `<${pageUrl(2)}>; rel="next"`,
              "X-GitHub-Media-Type": "github.v3; format=json",
            }
          : {},
    });
  }

  remain -= perPage;

  for (let page = 2; remain > 0; remain -= perPage, ++page) {
    const offset = (page - 1) * perPage;
    sandbox = sandbox.get(pageUrl(page), {
      body: entries.slice(offset, offset + perPage),
      headers:
        remain > perPage
          ? {
              link: `<${pageUrl(1 + page)}>; rel="next"`,
              "X-GitHub-Media-Type": "github.v3; format=json",
            }
          : {},
    });
  }
  return sandbox;
}

const Octokit = Core.plugin(listReleases);

function addOwnerRepo<P>(
  params: P & { owner?: string; repo?: string }
): P & { owner: string; repo: string } {
  return { owner: "owner", repo: "repo", ...params };
}

describe(".listReleases", () => {
  describe.each([
    [[{}], [], [""], []],
    [[{ owner: "github", repo: "docs" }], [1, 2], [""], [1, 2]],
    [[{ per_page: 100 }], [], ["?per_page=100"], []],
    [[{ per_page: 101 }], [], ["?per_page=101"], []],
    [[{}, 100], [], ["?per_page=100"], []],
    [[{}, 101], [], [""], []],
    [[{ per_page: 30 }, 100], [], ["?per_page=30"], []],
    [[{ per_page: 100 }, 30], [], ["?per_page=30"], []],
    [[{ per_page: 101 }, 30], [], ["?per_page=30"], []],
    [[{ per_page: 101 }, 101], [], ["?per_page=101"], []],
    [[{}, 4], [0, 1, 2, 3, 4, 5, 6, 7, 8], ["?per_page=4"], [0, 1, 2, 3]],
    [
      [{ per_page: 3 }, 4],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
      ["?per_page=3", "?page=2&per_page=3"],
      [0, 1, 2, 3],
    ],
  ])(
    `octokit.listReleases(%j) with releases: %j`,
    (args, releases, calls, output) => {
      const params = addOwnerRepo(args[0]);
      const owner = params.owner;
      const repo = params.repo;
      const endpoint = `https://api.github.com/repos/${owner}/${repo}/releases`;
      const max: [number] | [] = args.length > 1 ? [args[1] as number] : [];

      it(`queries ${repr(calls)}`, async () => {
        expect.assertions(1);
        const mock = createFetchMock(endpoint, params, releases, ...max);
        const octokit = new Octokit({
          request: {
            fetch: mock,
          },
        });
        await octokit.listReleases(params, ...max);
        const actualCalls = mock.calls().map((c) => c[0]);
        const expectCalls = calls.map((c) => `${endpoint}${c}`);
        expect(actualCalls).toStrictEqual(expectCalls);
      });

      it(`returns ${repr(output)}`, async () => {
        expect.assertions(1);
        const octokit = new Octokit({
          request: {
            fetch: createFetchMock(endpoint, params, releases, ...max),
          },
        });
        const data = await octokit.listReleases(params, ...max);
        expect(data).toStrictEqual(output);
      });
    }
  );
});
