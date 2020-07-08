/* ------------------------------------------------------------------------------------------- *
    The javascript for generating invoices...
    =========================================
* ------------------------------------------------------------------------------------------- */


/** functionality
 *  --------------------------------------------------------------------------------------------
**/
// format a number as printable currency string
const formatCurrencyString = total => total.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

// replace a single string
const simpleReplace = (node, key, content) => {
  node.innerHTML = content[key];
};

// print out the list of services
const printServices = (node, servicesArray) => {
  node.innerHTML = '';
  (servicesArray || []).forEach(
    (service) => {
      const li = document.createElement('li');
      li.className = 'service';

      const descWrap = document.createElement('div');
      descWrap.className = 'service__desc-wrap';

      const desc = document.createElement('span');
      desc.className = 'service__desc';
      desc.innerHTML = service.desc;

      const subDesc = document.createElement('span');
      subDesc.className = 'service__sub-desc service__sub-desc--empty';
      if (service.subDesc && service.subDesc.length > 1) {
        subDesc.innerHTML = service.subDesc;
        subDesc.className = 'service__sub-desc service__sub-desc--full';
      }

      const cost = document.createElement('strong');
      cost.className = 'service__cost currency';
      cost.innerHTML = formatCurrencyString(service.cost);

      descWrap.appendChild(desc);
      descWrap.appendChild(subDesc);
      li.appendChild(descWrap);
      li.appendChild(cost);
      node.appendChild(li);
    },
  );
};

// print the total cost of services
const printServicesTotal = (node, servicesArray) => {
  const servicesTotal = (servicesArray || []).reduce(
    (accumulator, currentService) => accumulator + (currentService.cost || 0),
    0,
  );

  node.innerHTML = formatCurrencyString(servicesTotal);
}

// print suitable bank details
const printBankDetails = (node, bankDetailsArray) => {
  node.innerHTML = '';
  (bankDetailsArray || []).forEach(
    (bankDetail) => {
      const li = document.createElement('li');
      li.className = 'bankDetail';

      const title = document.createElement('span');
      title.className = 'bankDetail__title';
      title.innerHTML = bankDetail.title;

      const value = document.createElement('strong');
      value.className = 'bankDetail__value';
      value.innerHTML = bankDetail.value;

      li.appendChild(title);
      li.appendChild(value);
      node.appendChild(li);
    },
  );
}


/** Doing something with the data
 *  --------------------------------------------------------------------------------------------
**/
const fillItAllIn = (content) => {
  const fillThese = document.querySelectorAll('.js--fill-me');

  const invoiceContent = { ...content };

  (fillThese || []).forEach(node => {
    switch (node.getAttribute('data-fill-method')) {
      case 'simple':
        simpleReplace(node, node.getAttribute('data-fill-with'), invoiceContent);
        node.classList.replace('js--fill-me--empty', 'js--fill-me--full');
        break;

      case 'servicesList':
        printServices(node, invoiceContent.services || []);
        node.classList.replace('js--fill-me--empty', 'js--fill-me--full');
        break;

      case 'servicesTotal':
        printServicesTotal(node, invoiceContent.services || []);
        node.classList.replace('js--fill-me--empty', 'js--fill-me--full');
        break;

      case 'duedate':
        if(!invoiceContent[node.getAttribute('data-fill-with')]) {
          document.getElementById('duedate').style.display = 'none';
        } else {
          simpleReplace(node, node.getAttribute('data-fill-with'), invoiceContent);
          node.classList.replace('js--fill-me--empty', 'js--fill-me--full');
        }
        break;

      case 'bankDetails':
        printBankDetails(
          node,
          invoiceContent.international ? invoiceContent.internationalBankDetails : invoiceContent.ukBankDetails,
        );
        node.classList.replace('js--fill-me--empty', 'js--fill-me--full');
        break;

      default:
        break;
    }
  });

  const titleEl = document.querySelector('title');
  if (titleEl && content.invoiceNo) {
    titleEl.innerHTML = `Invoice ${content.invoiceNo} - ${content.invoiceFor || ''} ${content.onBehalfOf || ''}`;
  }
};



/** loading json
 *  --------------------------------------------------------------------------------------------
**/
const loadFile = () => {
  if (typeof window.FileReader !== 'function') {
    alert('The file API isn\'t supported on this browser');
    return;
  }

  const input = document.getElementById('fileinput');
  if (!input.files) {
    alert('This browser doesn\'t seem to support the `files` property of file inputs.');
  }
  else if (!input.files[0]) {
    alert('Please select a file before clicking Load');
  }
  else {
    const file = input.files[0];
    const fr = new FileReader();
    fr.onload = (e) => receivedText(e);
    fr.readAsText(file);
  }

  const receivedText = (e) => {
    const lines = e.target.result;
    const content = JSON.parse(lines);
    fillItAllIn(content);
    document.querySelector('body').classList.replace('stage-0', 'stage-1');
  };
};
