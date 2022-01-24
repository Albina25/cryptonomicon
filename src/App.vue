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
      <button type="button" @click="add" class="btn">Добавить</button>
    </section>
    <hr class="line" />
    <template v-if="tickers.length">
      <div class="block-filter">
        <div class="row">
          Фильтр:<input class="input-filter" v-model="filter" />
        </div>
        <div class="row">
          <button
            class="btn btn-pugination"
            @click="page = page - 1"
            v-if="page > 1"
          >Назад</button>
          <button
            class="btn btn-pugination"
            @click="page = page + 1"
            v-if="hasNextPage"
          >Вперед</button>
        </div>
      </div>
      <hr class="line" />
      <dl class="container-tickers">
        <div
          v-for="t in paginatedTickers"
          :key="t.name"
          class="box-ticker"
          :class="{ 'selected-ticker': selectedTicker === t }"
          @click="select(t)"
        >
          <div class="box-ticker-information">
            <dt class="title-ticker">{{ t.name }} - USD</dt>
            <dd class="price-ticker">{{ t.price }}</dd>
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
          v-for="(bar, index) in normalizedGraph"
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
      filter: "",
      tickers: [],
      selectedTicker: "",
      graph: [],
      page: 1,
    };
  },

  created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());

    // const VALID_KEY = ['filter', 'page'];
    // VALID_KEY.forEach(key => {
    //   if (windowData[key]) {
    //     this[key] = windowData[key]
    //   }
    // });

    if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = windowData.page;
    }

    const tickersData = sessionStorage.getItem("cryptonomicon-list");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        this.subscribeToUpdates(ticker.name);
      });
    }
  },
  computed: {
    startIndexOfPage() {
      return (this.page - 1) * 6;
    },

    endIndexOfPage() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
          ticker.name.includes(this.filter)
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndexOfPage, this.endIndexOfPage);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndexOfPage;
    },

    normalizedGraph() {
      const maxPrice = Math.max(...this.graph);
      const minPrice = Math.min(...this.graph);

      if (maxPrice === minPrice) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minPrice) * 95) / (maxPrice - minPrice)
      );
    },

    pageStateOptions() {
      return {
        page: this.page,
        filter: this.filter,
      }
    },
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

      this.tickers = [...this.tickers, currentTicker];
      // this.tickers.push(currentTicker);
      this.filter = "";

      this.subscribeToUpdates(currentTicker.name);
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      this.selectedTicker = "";
    },
  },

  watch: {
    selectedTicker() {
      this.graph = [];
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;

      // window.history.pushState(
      //   null,
      //   document.title,
      //   `${window.location.pathname}?filter=${this.filter}&page=${this.page}`
      // );
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },

    tickers() {
      sessionStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },
  },
};
</script>

<style lang="scss" scoped>
@mixin btn {
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
@mixin input {
  display: flex;
  align-items: center;
  border: none;
  outline: none;
  color: var(--main-color, gray);
  box-shadow: 0 8px 6px -6px var(--input-color-placeholder);
  width: 15rem;
}
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
    @include input;
    margin-bottom: 1rem;
    height: 2.5rem;
  }
  .input-filter {
    @include input;
    color: black;
    margin-left: 1rem;
    width: 10rem;
  }
  input::placeholder {
    color: var(--input-color-placeholder, lightgray);
  }
  .btn {
    @include btn;
  }
  .row {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
  }
  .btn-pugination {
    @include btn;
    display: flex;
    flex-flow: row nowrap;
    margin-right: 1rem;
  }
  .block-filter {
    display: flex;
    margin: 1rem;
    flex-flow: row wrap;
    justify-content: space-between;
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
    &:hover {
      color: lightgray;
    }
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
@media screen and (max-width: 340px) {
  .btn-pugination {
    margin-bottom: 1rem;
    margin-right: 0;
  }
}
@media screen and (max-width: 614px) {
  .row {
    margin-bottom: 1rem;
  }
}
</style>
