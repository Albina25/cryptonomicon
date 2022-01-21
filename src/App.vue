<template>
  <div class="app">
    <section class="container-add-ticker">
      <label class="text-ticker">Тикер</label>
      <input
        class="input-add-ticker"
        v-model="ticker"
        @keydown.enter="add"
        type="text"
        placeholder="Например DOGE"
      />
      <button type="button" @click="add" class="button-add">Добавить</button>
    </section>
    <template v-if="tickers.length > 0">
      <hr class="line" />
      <dl class="container-tickers">
        <div
          v-for="t in tickers"
          :key="t.name"
          class="box-ticker"
          :class="{ 'selected-ticker': selectedTicker === t }"
          @click="select(t)"
        >
          <div class="box-ticker-information">
            <dt class="title-ticker">{{ t.name }} - USD</dt>
            <dd class="price-ticker">
              {{ t.price }}
            </dd>
          </div>
          <div>
            <button class="button-delete" @click.stop="handleDelete(t)">
              Удалить
            </button>
          </div>
        </div>
      </dl>
      <hr class="line" />
    </template>
    <section v-if="selectedTicker" class="container-graph">
      <h3 class="title-graph">{{ selectedTicker.name }} - USD</h3>
      <div class="box-graph">
        <div
          v-for="(bar, index) in normalizeGraph()"
          :key="index"
          :style="{ height: `${bar}%` }"
          class="bar-graph"
        ></div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      ticker: "",
      tickers: [],
      selectedTicker: "",
      graph: [],
    };
  },

  created() {
    const tickersData = sessionStorage.getItem("cryptonomicon-list");
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        this.subscribeToUpdates(ticker.name);
      });
    }
  },

  methods: {
    subscribeToUpdates(tickerName) {
      setInterval(async () => {
        const f = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api-key=d33aa022c48f34ea62feec55cdafbeba4efc8d1b0368d70a47747aaa90dccecd`
        );
        const data = await f.json();
        this.tickers.find((t) => t.name === tickerName).price =
          data.USD > 1 ? data.USD.toFixed(2) : data.USD.toPrecision(2);

        if (this.selectedTicker?.name === tickerName) {
          this.graph.push(data.USD);
        }
      }, 5000);
      this.ticker = "";
    },

    add() {
      const currentTicker = {
        name: this.ticker,
        price: "-",
      };

      this.tickers.push(currentTicker);

      sessionStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
      this.subscribeToUpdates(currentTicker.name);
    },

    select(ticker) {
      this.selectedTicker = ticker;
      this.graph = [];
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      this.selectedTicker = "";
    },

    normalizeGraph() {
      const maxPrice = Math.max(...this.graph);
      const minPrice = Math.min(...this.graph);
      return this.graph.map(
        (price) => 5 + ((price - minPrice) * 95) / (maxPrice - minPrice)
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.app {
  .container-add-ticker {
    display: flex;
    flex-direction: column;
    margin: 1rem 1rem;
  }
  .text-ticker {
    margin-bottom: 1rem;
  }
  .input-add-ticker {
    display: flex;
    align-items: center;
    border: none;
    outline: none;
    color: var(--main-color, gray);
    box-shadow: 0 8px 6px -6px var(--input-color-placeholder);
    margin-bottom: 1rem;
    width: 15rem;
    height: 2.5rem;
  }
  input::placeholder {
    color: var(--input-color-placeholder, lightgray);
  }
  .button-add {
    display: flex;
    background: var(--main-color, darkgray);
    color: var(--button-add-text-color, white);
    height: 2rem;
    width: 7rem;
    padding: 1rem;
    border: none;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    border-radius: 50px;
    cursor: pointer;
  }
  .line {
    border-color: var(--input-color-placeholder);
    margin: 0 1rem;
  }
  .container-tickers {
    display: flex;
    flex-flow: row wrap;
  }
  .button-delete {
    border: none;
    background: none;
    color: var(--main-color, darkgray);
    font-size: 0.7rem;
    cursor: pointer;
  }
  .box-ticker {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 10rem;
    margin: 1rem;
    padding: 1rem;
  }
  .box-ticker-information {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1rem;
  }
  .title-ticker {
    color: var(--main-color, darkgray);
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
  }
  .price-ticker {
    font-size: 2rem;
  }
  .container-graph {
    margin: 1rem;
  }
  .box-graph {
    display: flex;
    align-items: flex-end;
    border: 1px solid lightgray;
    height: 15rem;
    border-top: none;
    border-right: none;
  }
  .title-graph {
    margin-bottom: 1rem;
  }
  .bar-graph {
    background-color: var(--select-graph-color, purple);
    width: 1rem;
    border: 1px solid white;
    border-bottom: none;
  }
  .selected-ticker {
    border: 2px solid var(--select-graph-color, purple);
  }
}
</style>
